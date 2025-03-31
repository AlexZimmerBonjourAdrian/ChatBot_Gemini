// Variable global para almacenar el historial de la conversación
let conversationHistory = [];

const callAPI = () => {
  const paragraph = document.getElementById("text-input");
  const output = document.getElementById("text-output");
  const apiKeyInput = document.getElementById("api-key-input");
  const loading = document.getElementById("loading");
  const text = paragraph.value;
  const apiKey = apiKeyInput.value;

  // Validar que la API key no esté vacía
  if (!apiKey) {
    output.innerHTML = '<div class="error">Por favor, ingresa tu API key de Google</div>';
    return;
  }

  // Validar que haya texto para enviar
  if (!text.trim()) {
    output.innerHTML = '<div class="error">Por favor, escribe una pregunta</div>';
    return;
  }

  // Mostrar estado de carga
  loading.style.display = 'block';
  output.innerHTML = '';

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

  query({
    inputs: text,
  }).then((response) => {
    loading.style.display = 'none';
    if (response.candidates && response.candidates[0]) {
      const formattedText = formatResponse(response.candidates[0].content.parts[0].text);
      output.innerHTML = formattedText;
      
      // Agregar la respuesta del modelo al historial
      conversationHistory.push({
        role: "model",
        parts: [{ text: response.candidates[0].content.parts[0].text }]
      });
    } else {
      output.innerHTML = `<div class="error">Error: ${response.error?.message || 'Error desconocido'}</div>`;
    }
  }).catch((error) => {
    loading.style.display = 'none';
    output.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  });
};

// Función para limpiar el historial de la conversación
const clearHistory = () => {
  conversationHistory = [];
  document.getElementById("text-output").innerHTML = "La conversación ha sido reiniciada.";
};
