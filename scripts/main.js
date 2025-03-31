const callAPI = () => {
  console.log("callAPI. Hello World!");

  const paragraph = document.getElementById("text-input");
  const output = document.getElementById("text-output");
  const apiKeyInput = document.getElementById("api-key-input");
  const text = paragraph.value;
  const apiKey = apiKeyInput.value;

  // Validar que la API key no esté vacía
  if (!apiKey) {
    output.innerHTML = "Por favor, ingresa tu API key de Googl ";
    return;
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  async function query(data) {
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
  }

  query({
    inputs: text,
  }).then((response) => {
    if (response.candidates && response.candidates[0]) {
      output.innerHTML = response.candidates[0].content.parts[0].text;
    } else {
      output.innerHTML = `Error: ${response.error?.message || 'Error desconocido'}`;
    }
  });
};
