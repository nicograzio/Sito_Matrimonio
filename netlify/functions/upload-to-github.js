const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// Handler principale dell'evento Lambda
exports.handler = async (event, context) => {
  // Gestione delle richieste OPTIONS per il CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  // Verifica che il metodo HTTP sia POST, altrimenti ritorna un errore 405
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

  // Estrazione del token GitHub e dei dati dall'evento
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const { files, deviceName } = JSON.parse(event.body);
  const repoOwner = 'nicograzio';
  const repoName = 'Sito_Matrimonio';

  let uploadResults = [];

  // Loop per caricare i file su GitHub
  for (const { fileContent, fileName } of files) {
    const filePath = `photosToCheck/${fileName}`;
    const githubApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    const requestBody = {
      message: `Aggiunto nuovo file: ${fileName}`,
      content: Buffer.from(fileContent, 'base64').toString('base64'),
      // Lo SHA non è necessario dato che i file sono sempre univoci
    };

    try {
      const response = await fetch(githubApiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseBody = await response.json();

      if (!response.ok) {
        console.error(`Errore nel caricamento del file ${fileName}: ${response.status} ${response.statusText}`);
        console.error('Dettagli della risposta:', responseBody);
        throw new Error(`Errore nel caricamento del file ${fileName}: ${response.status} ${response.statusText}`);
      }

      uploadResults.push({ fileName, status: 'success' });
    } catch (error) {
      console.error(`Errore nel caricamento del file ${fileName}:`, error.message);
      uploadResults.push({ fileName, status: 'error', message: error.message });
    }
  }

  // Filtra i risultati per individuare eventuali errori
  const errors = uploadResults.filter(result => result.status === 'error');

  if (errors.length > 0) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Errore nel caricamento di uno o più file.',
        details: errors,
      }),
    };
  }

  // Invia una email di notifica
  await sendEmailNotification(deviceName, uploadResults);

  // Ritorna una risposta di successo
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      message: 'File caricati con successo!\nLe foto saranno disponibili nella galleria non appena le avremo controllate.',
      details: uploadResults,
    }),
  };

  async function sendEmailNotification(deviceName, uploadResults) {
    try {
  
      // Configura OAuth2 per Nodemailer
      const oauth2Client = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
      );
      
      oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
      });
      
      const accessToken = await oauth2Client.getAccessToken();
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_USER,
          accessToken: accessToken.token,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_DEST,
        subject: 'Nuove foto caricate',
        text: `Sono state caricate delle nuove foto da ${deviceName}.\n\nElenco dei file:\n${uploadResults.map(file => file.fileName).join('\n')}`,
      };
  
      await transporter.sendMail(mailOptions);
      console.log('Email inviata con successo');
    } catch (error) {
      console.error('Errore nell\'invio della email:', error.message);
    }
  }
  
};
