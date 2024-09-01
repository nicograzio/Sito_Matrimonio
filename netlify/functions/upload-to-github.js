const fetch = require('node-fetch');

exports.handler = async (event, context) => {  
  if (event.httpMethod !== 'POST') {
    console.log('Metodo non consentito');
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Metodo non consentito' }),
    };
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Usa le variabili di ambiente per sicurezza
  console.log('Token ottenuto:', GITHUB_TOKEN ? 'Si' : 'No');

  const { files } = JSON.parse(event.body); // Recupera l'array di file dal body della richiesta
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
      body: JSON.stringify({ 
        message: 'Errore nel caricamento di uno o più file.',
        details: errors
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ 
      message: 'File caricati con successo!<br>Le foto saranno disponibili nella galleria non appena le avremo controllate.',
      details: uploadResults
    }),
  };
};
