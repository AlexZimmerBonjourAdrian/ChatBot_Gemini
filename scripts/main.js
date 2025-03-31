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
      const response = await fetch(
        API_URL,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify({
            contents: [{
              parts: [{ text: data.inputs }]
            }]
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
      const formattedText = response.candidates[0].content.parts[0].text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .join('\n\n');
      output.innerHTML = formattedText;
    } else {
      output.innerHTML = `<div class="error">Error: ${response.error?.message || 'Error desconocido'}</div>`;
    }
  }).catch((error) => {
    loading.style.display = 'none';
    output.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  });
};
