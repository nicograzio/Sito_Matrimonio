const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Metodo non consentito' }),
    };
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Usa le variabili di ambiente per sicurezza
  const { fileContent, fileName } = JSON.parse(event.body); // Recupera il contenuto e il nome del file dal body della richiesta
  const repoOwner = 'nicograzio'; // Inserisci il tuo nome utente GitHub
  const repoName = 'Sito_Matrimonio'; // Inserisci il nome del repository
  const filePath = 'images/${fileName}'; // Specifica il percorso del file nel repo

  const githubApiUrl = 'https://api.github.com/repos/${repoOwner}/${repoName}/${filePath}';

  const requestBody = {
    message: 'Aggiunto nuovo file',  // Messaggio di commit per il caricamento del file
    content: Buffer.from(fileContent, 'base64').toString(),  // Codifica il contenuto del file in base64
  };

  try {
    const response = await fetch(githubApiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': token ${GITHUB_TOKEN},  // Usa il token GitHub per autorizzare la richiesta
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),  // Invia il corpo della richiesta con i dettagli del commit
    });

    if (!response.ok) {
      throw new Error('Errore nel caricamento del file: ${response.statusText}');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'File caricato con successo su GitHub!' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Errore nel caricamento su GitHub.' }),
    };
  }
};
