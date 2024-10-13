const tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-node");
const { HfInference } = require("@huggingface/inference");

const hf = new HfInference("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"); // Sua chave de API
const MODEL_PATH = "model/tf_model"; // Caminho onde o modelo será salvo

// Função para treinar o modelo de Machine Learning
async function treinarModelo() {
  const model = tf.sequential();
  model.add(
    tf.layers.dense({ units: 10, activation: "relu", inputShape: [20] }) // 20 características de entrada
  );
  model.add(tf.layers.dense({ units: 2, activation: "softmax" }));

  model.compile({
    loss: "categoricalCrossentropy",
    optimizer: "adam",
    metrics: ["accuracy"],
  });

  // Exemplos de dados para treinamento (substitua por seus próprios dados)
  const xs = tf.tensor2d([
    // Aqui adicionamos exemplos que têm exatamente 20 características
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Exemplo 1
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Exemplo 2
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Exemplo 3
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Exemplo 4
  ]);

  const ys = tf.tensor2d([
    [1, 0], // Saída para o exemplo 1
    [0, 1], // Saída para o exemplo 2
    [1, 0], // Saída para o exemplo 3
    [0, 1], // Saída para o exemplo 4
  ]);

  await model.fit(xs, ys, { epochs: 10 });

  // Salva o modelo
  await model.save(`file://${MODEL_PATH}`);

  return model;
}

// Função para prever uma solução com base no modelo treinado
async function preverSolucao(entidade) {
  // Aqui você chamaria o modelo do Hugging Face para fazer previsões
  const resposta = await hf.textGeneration({
    model: "pierreguillou/gpt2-small-portuguese",
    inputs: entidade,
  });

  return resposta.generated_text; // Ajuste conforme a estrutura de resposta da API
}

module.exports = { treinarModelo, preverSolucao };
