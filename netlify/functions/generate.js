const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    try {
        const { text, history } = JSON.parse(event.body);
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.API_KEY}`;

        const API_KEY = process.env.API_KEY;
        console.log('API_KEY configured:', API_KEY ? 'YES' : 'NO');
        if (!API_KEY) {
            console.error('API_KEY is not set in environment variables.');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'API_KEY no configurada.' })
            };
        }

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
            console.error('Gemini API Error Details:', {
                status: result.error.status || 'Unknown',
                code: result.error.code || 'Unknown',
                message: result.error.message || 'Unknown error',
                details: result.error.details || 'No additional details'
            });
            return {
                statusCode: 400,
                body: JSON.stringify({ 
                    error: result.error.message,
                    status: result.error.status,
                    code: result.error.code,
                    details: result.error.details
                })
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