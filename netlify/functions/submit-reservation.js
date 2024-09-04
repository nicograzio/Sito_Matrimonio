exports.handler = async function(event, context) {
    const { Octokit } = await import("@octokit/rest");

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
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
            const newLine = `${data.name},${data.participants},${data.notes}\n`;
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

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'File aggiornato con successo!' })
        };
    } catch (error) {
        console.error('Errore:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Errore durante l\'aggiornamento del file' })
        };
    }
};
