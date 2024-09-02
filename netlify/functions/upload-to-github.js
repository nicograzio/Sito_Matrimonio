const fetch = require('node-fetch');
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {  
  // Gestisci la richiesta preflight (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',  // Permette richieste da qualsiasi origine
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',  // Permette gli header necessari
        'Access-Control-Allow-Methods': 'POST, OPTIONS'  // Metodi permessi
      },
      body: '',  // Nessun corpo per la risposta preflight
    };
  }

  // Controlla se il metodo non è POST
  if (event.httpMethod !== 'POST') {
    console.log('Metodo non consentito');
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Metodo non consentito' }),
    };
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Usa le variabili di ambiente per sicurezza
  console.log('Token ottenuto:', GITHUB_TOKEN ? 'Si' : 'No');

  const { files, deviceName } = JSON.parse(event.body); // Recupera l'array di file e il nome del dispositivo dal body della richiesta
  const repoOwner = 'nicograzio'; // Inserisci il tuo nome utente GitHub
  const repoName = 'Sito_Matrimonio'; // Inserisci il nome del repository

  // Array per raccogliere i risultati di ogni caricamento
  let uploadResults = [];

  for (let i = 0; i < files.length; i++) {
    const { fileContent, fileName } = files[i];
    const filePath = `images/${fileName}`; // Specifica il percorso del file nel repo

    const githubApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    const requestBody = {
      message: `Aggiunto nuovo file: ${fileName}`,  // Messaggio di commit per il caricamento del file
      content: Buffer.from(fileContent, 'base64').toString('base64'),  // Codifica il contenuto del file in base64
    };

    try {
      const response = await fetch(githubApiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,  // Usa il token GitHub per autorizzare la richiesta
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),  // Invia il corpo della richiesta con i dettagli del commit
      });

      if (!response.ok) {
        throw new Error(`Errore nel caricamento del file ${fileName}: ${response.statusText}`);
      }

      // Aggiungi il risultato del caricamento all'array
      uploadResults.push({ fileName, status: 'success' });
    } catch (error) {
      console.error(error);
      // Aggiungi l'errore all'array dei risultati
      uploadResults.push({ fileName, status: 'error', message: error.message });
    }
  }

  // Controlla se ci sono stati errori nel caricamento
  const errors = uploadResults.filter(result => result.status === 'error');

  if (errors.length > 0) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        message: 'Errore nel caricamento di uno o più file.',
        details: errors
      }),
    };
  }

  // Invia una email di notifica se tutti i file sono stati caricati correttamente
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Usa il servizio che preferisci (es: Gmail, SendGrid)
      auth: {
        user: process.env.EMAIL_USER, // Usa una variabile di ambiente per l'email
        pass: process.env.EMAIL_PASS, // Usa una variabile di ambiente per la password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_DEST, // Inserisci l'indirizzo email del destinatario
      subject: 'Nuove foto caricate',
      text: `Sono state caricate delle nuove foto da ${deviceName}.\n\nElenco dei file:\n${uploadResults.map(file => file.fileName).join('\n')}`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email inviata con successo');
  } catch (emailError) {
    console.error('Errore nell\'invio della email:', emailError);
  }
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ 
      message: 'File caricati con successo!\nLe foto saranno disponibili nella galleria non appena le avremo controllate.',
      details: uploadResults
    }),
  };
};
