const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { Octokit } = require('@octokit/rest');

exports.handler = async function(event, context) {
    
    // Imposta gli header CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (event.httpMethod === 'OPTIONS') {
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
    const filePath = 'reservations/data.csv'; 
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
            sha: fileData.sha 
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
        // Configura OAuth2 client
        const oAuth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
        );

        oAuth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN
        });

        try {
            // Ottieni il token di accesso
            const accessToken = await oAuth2Client.getAccessToken();

            // Configura il trasporto SMTP utilizzando OAuth2
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.EMAIL_USER,
                    clientId: process.env.CLIENT_ID,
                    clientSecret: process.env.CLIENT_SECRET,
                    refreshToken: process.env.REFRESH_TOKEN,
                    accessToken: accessToken.token,  // Il token di accesso appena ottenuto
                },
            });

            // Crea il messaggio email
            let info = await transporter.sendMail({
                from: `"Prenotazioni Sito" <${process.env.EMAIL_USER}>`, // mittente
                to: process.env.EMAIL_DEST, // destinatario
                subject: 'Nuova Prenotazione', // Oggetto
                text: `Ciao,\nhai una nuova prenotazione.\n\nDettagli:\n- Nome: ${data.name}\n- Numero ospiti: ${data.guests}\n- Note: ${data.notes}`, // Corpo del messaggio
            });

            console.log("Messaggio inviato:", info.messageId);
        } catch (error) {
            console.error("Errore nell'invio dell'email:", error);
        }
    }
};
