const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    try {
        const { text, history } = JSON.parse(event.body);
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.API_KEY}`;

        const response = await fetch(API_URL, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                contents: history
            })
        });

        const result = await response.json();
        
        // Verificar si hay error en la respuesta
        if (result.error) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: result.error.message })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}; 