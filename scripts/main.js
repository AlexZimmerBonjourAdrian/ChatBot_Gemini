// Variable global para almacenar el historial de la conversación
let conversationHistory = [];

// Función para formatear el texto de respuesta
function formatResponse(text) {
    // Dividir el texto en párrafos
    let paragraphs = text.split('\n\n').filter(p => p.trim());
    
    // Formatear cada párrafo
    paragraphs = paragraphs.map(paragraph => {
        // Detectar listas
        if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('*')) {
            const items = paragraph.split('\n')
                .filter(item => item.trim().startsWith('-') || item.trim().startsWith('*'))
                .map(item => `<li>${item.replace(/^[-*]\s*/, '')}</li>`);
            return `<ul>${items.join('')}</ul>`;
        }
        
        // Detectar código
        if (paragraph.includes('```')) {
            const codeBlocks = paragraph.split('```');
            return codeBlocks.map((block, index) => {
                if (index % 2 === 1) {
                    return `<pre><code>${block.trim()}</code></pre>`;
                }
                return block.trim() ? `<p>${block.trim()}</p>` : '';
            }).join('');
        }
        
        // Detectar texto en negrita
        paragraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Detectar texto en cursiva
        paragraph = paragraph.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Detectar código en línea
        paragraph = paragraph.replace(/`(.*?)`/g, '<code>$1</code>');
        
        return paragraph.trim() ? `<p>${paragraph.trim()}</p>` : '';
    });
    
    return paragraphs.join('\n');
}

// Función para agregar un mensaje al chat
function addMessageToChat(text, isUser = false) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = formatResponse(text);
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll al último mensaje
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

const callAPI = () => {
    const paragraph = document.getElementById("text-input");
    const apiKeyInput = document.getElementById("api-key-input");
    const loading = document.getElementById("loading");
    const text = paragraph.value;
    const apiKey = apiKeyInput.value;

    // Validar que la API key no esté vacía
    if (!apiKey) {
        addMessageToChat('Por favor, ingresa tu API key de Google', true);
        return;
    }

    // Validar que haya texto para enviar
    if (!text.trim()) {
        addMessageToChat('Por favor, escribe una pregunta', true);
        return;
    }

    // Mostrar el mensaje del usuario
    addMessageToChat(text, true);
    paragraph.value = '';

    // Mostrar estado de carga
    loading.style.display = 'block';

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    async function query(data) {
        try {
            // Agregar el mensaje del usuario al historial
            conversationHistory.push({
                role: "user",
                parts: [{ text: data.inputs }]
            });

            const response = await fetch(
                API_URL,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify({
                        contents: conversationHistory
                    })
                }
            );
            const result = await response.json();
            return result;
        } catch (error) {
            throw new Error('Error al conectar con la API: ' + error.message);
        }
    }

    query({
        inputs: text,
    }).then((response) => {
        loading.style.display = 'none';
        if (response.candidates && response.candidates[0]) {
            const responseText = response.candidates[0].content.parts[0].text;
            addMessageToChat(responseText);
            
            // Agregar la respuesta del modelo al historial
            conversationHistory.push({
                role: "model",
                parts: [{ text: responseText }]
            });
        } else {
            addMessageToChat(`Error: ${response.error?.message || 'Error desconocido'}`);
        }
    }).catch((error) => {
        loading.style.display = 'none';
        addMessageToChat(`Error: ${error.message}`);
    });
};

// Función para limpiar el historial de la conversación
const clearHistory = () => {
    conversationHistory = [];
    document.getElementById("chat-messages").innerHTML = '';
    addMessageToChat("La conversación ha sido reiniciada.");
};

// Evento para enviar mensaje con Enter (Shift+Enter para nueva línea)
document.getElementById("text-input").addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        callAPI();
    }
});
