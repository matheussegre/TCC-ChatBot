const tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-node"); // Importa tfjs-node para funcionalidade de arquivos
const { HfInference } = require("@huggingface/inference");

const hf = new HfInference("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"); // Substitua pela sua chave de API
const MODEL_PATH = "../model/tf_model"; // Caminho onde o modelo será salvo
const TOKENIZER_PATH = "tokenizer"; // Caminho onde o tokenizer será salvo

// Função para treinar o modelo de Machine Learning
async function treinarModelo() {
  // Verifica se o diretório existe, se não existir, cria
  const fs = require("fs");
  if (!fs.existsSync(MODEL_PATH)) {
    fs.mkdirSync(MODEL_PATH, { recursive: true });
  }

  const model = tf.sequential();
  model.add(
    tf.layers.dense({ units: 10, activation: "relu", inputShape: [20] })
  );
  model.add(tf.layers.dense({ units: 2, activation: "softmax" }));

  model.compile({
    loss: "categoricalCrossentropy",
    optimizer: "adam",
    metrics: ["accuracy"],
  });

  // Exemplos de dados para treinamento (substitua por seus próprios dados)
  const xs = tf.tensor2d([
    [0, 1],
    [1, 0],
  ]);
  const ys = tf.tensor2d([
    [1, 0],
    [0, 1],
  ]);

  await model.fit(xs, ys, { epochs: 10 });

  // Salva o modelo
  await model.save(`file://${MODEL_PATH}`);

  return model;
}

// Função para prever uma solução com base no modelo treinado usando Hugging Face
async function preverSolucao(entidade) {
  try {
    // Faz a inferência usando o modelo GPT-2
    const response = await hf.textGeneration({
      model: "pierreguillou/gpt2-small-portuguese", // Modelo que você deseja usar
      inputs: entidade,
    });

    // Retorna a resposta gerada
    return response.generated_text;
  } catch (error) {
    console.error("Erro ao prever solução:", error);
    throw new Error("Falha na previsão da solução.");
  }
}

module.exports = { treinarModelo, preverSolucao }; // Exporta as funções para serem usadas no bot
