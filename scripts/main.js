// Variable global para almacenar el historial de la conversación
let conversationHistory = [];

// Función para formatear el texto de respuesta
function formatResponse(text) {
    // 1. Detectar bloques de código primero para protegerlos
    const codeBlocks = [];
    text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
        const id = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push(`<pre><code>${code.trim()}</code></pre>`);
        return id;
    });

    // 2. Formatear negritas, cursivas y código en línea
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');

    // 3. Dividir por líneas para procesar listas y párrafos
    const lines = text.split('\n');
    let htmlResult = '';
    let inList = false;
    let listType = ''; // 'ul' o 'ol'

    lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // Detectar elementos de lista desordenada (- o *)
        const isUnordered = /^[-*]\s+/.test(trimmedLine);
        // Detectar elementos de lista ordenada (1. 2. etc)
        const isOrdered = /^\d+\.\s+/.test(trimmedLine);

        if (isUnordered || isOrdered) {
            const currentType = isUnordered ? 'ul' : 'ol';
            const content = trimmedLine.replace(/^([-*]|\d+\.)\s+/, '');

            if (!inList) {
                htmlResult += `<${currentType}>`;
                inList = true;
                listType = currentType;
            } else if (listType !== currentType) {
                htmlResult += `</${listType}><${currentType}>`;
                listType = currentType;
            }
            htmlResult += `<li>${content}</li>`;
        } else {
            if (inList) {
                htmlResult += `</${listType}>`;
                inList = false;
            }
            if (trimmedLine) {
                htmlResult += `<p>${trimmedLine}</p>`;
            }
        }
    });

    if (inList) htmlResult += `</${listType}>`;

    // 4. Reinsertar los bloques de código
    codeBlocks.forEach((block, index) => {
        htmlResult = htmlResult.replace(`__CODE_BLOCK_${index}__`, block);
    });

    return htmlResult;
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

// Definir las funciones globales
function callAPI() {
    const paragraph = document.getElementById("text-input");
    const loading = document.getElementById("loading");
    const text = paragraph.value;

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

    // Agregar el mensaje del usuario al historial
    conversationHistory.push({
        role: "user",
        parts: [{ text: text }]
    });

    // Llamar a la función serverless de Netlify
    fetch('/.netlify/functions/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: text,
            history: conversationHistory
        })
    })
    .then(response => response.json())
    .then(response => {
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
    })
    .catch((error) => {
        loading.style.display = 'none';
        addMessageToChat(`Error: ${error.message}`);
    });
}

function clearHistory() {
    conversationHistory = [];
    document.getElementById("chat-messages").innerHTML = '';
    addMessageToChat("La conversación ha sido reiniciada.");
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Agregar el evento de Enter al input
    document.getElementById("text-input").addEventListener("keydown", function(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            callAPI();
        }
    });

    // Hacer las funciones disponibles globalmente
    window.callAPI = callAPI;
    window.clearHistory = clearHistory;
});
