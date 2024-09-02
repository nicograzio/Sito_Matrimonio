const fetch = require('node-fetch');
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
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

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const { files, deviceName } = JSON.parse(event.body);
  const repoOwner = 'nicograzio';
  const repoName = 'Sito_Matrimonio';

  const getFileSha = async (githubApiUrl) => {
    try {
      const response = await fetch(githubApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        return data.sha;
      }
    } catch (error) {
      console.error('Errore nel recupero dello SHA del file:', error.message);
    }
    return null;
  };

  let uploadResults = [];

  for (let i = 0; i < files.length; i++) {
    const { fileContent, fileName } = files[i];
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${fileName}`;
    const filePath = `images/${uniqueFileName}`;
    const githubApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const sha = await getFileSha(githubApiUrl);

    const requestBody = {
      message: `Aggiunto nuovo file: ${uniqueFileName}`,
      content: Buffer.from(fileContent, 'base64').toString('base64'),
      sha,
    };

    console.log(`Caricamento del file ${uniqueFileName} all'URL: ${githubApiUrl}`);
    console.log(`Corpo della richiesta: ${JSON.stringify(requestBody)}`);

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
      console.log('Risposta API GitHub:', responseBody);

      if (!response.ok) {
        console.error(`Errore nel caricamento del file ${uniqueFileName}: ${response.status} ${response.statusText}`);
        console.error('Dettagli della risposta:', responseBody);
        throw new Error(`Errore nel caricamento del file ${uniqueFileName}: ${response.status} ${response.statusText}`);
      }

      uploadResults.push({ fileName: uniqueFileName, status: 'success' });
    } catch (error) {
      console.error('Errore:', error.message);
      uploadResults.push({ fileName: uniqueFileName, status: 'error', message: error.message });
    }
  }

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

  try {
    const transporter = nodemailer.createTransport({
      service: 'hotmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
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
  } catch (emailError) {
    console.error('Errore nell\'invio della email:', emailError.message);
  }

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
};
