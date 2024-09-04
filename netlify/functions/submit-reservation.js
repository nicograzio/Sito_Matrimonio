exports.handler = async function(event, context) {
    const { Octokit } = await import("@octokit/rest");
    const nodemailer = require('nodemailer');

    // Imposta gli header CORS
    const headers = {
        'Access-Control-Allow-Origin': '*', // Permette richieste da qualsiasi origine. Modifica se necessario.
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (event.httpMethod === 'OPTIONS') {
        // Gestisci le richieste preflight OPTIONS
        return {
            statusCode: 204,
            headers,
        };
    }

    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            headers,
            body: 'Method Not Allowed' 
        };
    }

    const data = JSON.parse(event.body);

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    const repoOwner = 'nicograzio';
    const repoName = 'Sito_Matrimonio';
    const filePath = 'reservations/data.csv';  // O 'data.json'
    const commitMessage = 'Aggiunta nuova prenotazione';

    try {
        // Recupero del file esistente
        const { data: fileData } = await octokit.repos.getContent({
            owner: repoOwner,
            repo: repoName,
            path: filePath
        });

        // Decodifica del contenuto base64
        const content = Buffer.from(fileData.content, 'base64').toString('utf8');

        // Aggiungi nuova riga CSV o entry JSON
        let updatedContent;

        if (filePath.endsWith('.csv')) {
            const newLine = `${data.name},${data.guests},${data.notes}\n`;
            updatedContent = content + newLine;
        } else if (filePath.endsWith('.json')) {
            const jsonData = JSON.parse(content);
            jsonData.push(data);
            updatedContent = JSON.stringify(jsonData, null, 2);
        }

        // Codifica del nuovo contenuto in base64
        const newContentEncoded = Buffer.from(updatedContent).toString('base64');

        // Aggiornamento del file su GitHub
        await octokit.repos.createOrUpdateFileContents({
            owner: repoOwner,
            repo: repoName,
            path: filePath,
            message: commitMessage,
            content: newContentEncoded,
            sha: fileData.sha // necessario per l'aggiornamento del file esistente
        });

        // Invia l'email di notifica
        await sendEmailNotification(data);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Grazie mille, abbiamo aggiunto la tua prenotazione!' })
        };
    } catch (error) {
        console.error('Errore:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Errore durante l\'aggiornamento del file' })
        };
    }

    async function sendEmailNotification(data) {
        // Configura il trasporto SMTP utilizzando un account Gmail
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Email Gmail utente
                pass: process.env.EMAIL_PASS, // Password o App Password di Gmail
            },
        });

        // Crea il messaggio email
        let info = await transporter.sendMail({
            from: `"Prenotazioni Sito" <${process.env.EMAIL_USER}>`, // mittente
            to: 'EMAIL_DEST', // destinatario
            subject: 'Nuova Prenotazione', // Oggetto
            text: `Ciao,\nhai una nuova prenotazione.\n\nDettagli:\n- Nome: ${data.name}\n- Numero ospiti: ${data.guests}\n- Note: ${data.notes}`, // Corpo del messaggio
        });
    }
};
