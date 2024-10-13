const tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-node"); // Importa tfjs-node para funcionalidade de arquivos

const MODEL_PATH = "model/tf_model"; // Caminho onde o modelo será salvo

// Função para treinar o modelo de Machine Learning
async function treinarModelo() {
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

// Função para prever uma solução com base no modelo treinado
async function preverSolucao(entidade) {
  const model = await tf.loadLayersModel(`file://${MODEL_PATH}/model.json`); // Carrega o modelo salvo

  // Aqui você colocaria a lógica para passar a entidade para o modelo e gerar a previsão
  // Este é um exemplo simplificado
  return `Solução para o problema ${entidade}: verifique a sintaxe na linha X.`;
}

module.exports = { treinarModelo, preverSolucao };
