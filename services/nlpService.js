const axios = require("axios");

// Função para processar o NLP usando a API Hugging Face
const processarNLP = async (input) => {
  const apiKey = "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"; // Defina a variável de ambiente com a sua chave
  const model = "pierreguillou/gpt2-small-portuguese"; // Ou o modelo que você quiser usar

  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: input },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    // Retorna a resposta do modelo GPT-2
    return response.data[0].generated_text;
  } catch (error) {
    console.error(
      "Erro ao chamar a API Hugging Face:",
      error.response?.data || error.message
    );
    throw new Error("Falha no processamento do NLP.");
  }
};

module.exports = { processarNLP };
