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
  const repoOwner = 'nome-utente-github'; // Inserisci il tuo nome utente GitHub
  const repoName = 'nome-repo'; // Inserisci il nome del repository
  const filePath = percorso/nella/cartella/${fileName}; // Specifica il percorso del file nel repo

  const githubApiUrl = https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath};

  const requestBody = {
    message: 'Aggiunto nuovo file',
    content: Buffer.from(fileContent).toString('base64'), // Codifica il contenuto del file in Base64
  };
