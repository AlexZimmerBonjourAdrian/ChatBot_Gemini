const callAPI = () => {
  console.log("callAPI. Hello World!");

  const paragraph = document.getElementById("text-input");
  const output = document.getElementById("text-output");
  const apiKeyInput = document.getElementById("api-key-input");
  const text = paragraph.value;
  const apiKey = apiKeyInput.value;

  // Validar que la API key no esté vacía
  if (!apiKey) {
    output.innerHTML = "Por favor, ingresa tu API key";
    return;
  }

  const API_URL = "https://router.huggingface.co/fireworks-ai/inference/v1/chat/completions";
  
  async function query(data) {
    const response = await fetch(
      API_URL,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: data.inputs
            }
          ],
          max_tokens: 500,
          model: "accounts/fireworks/models/deepseek-v3-0324"
        })
      }
    );
    const result = await response.json();
    return result;
  }

  query({
    inputs: text,
  }).then((response) => {
    output.innerHTML = response.choices[0].message.content;
  });
};
