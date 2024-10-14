const tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-node");

// Função para tokenizar o texto (converte strings em vetores de números)
function tokenizarTexto(texto) {
  // Exemplo simples de tokenização (pode ser melhorado)
  const vocabulario = {};
  let index = 1; // Começa o index de 1 para palavras
  const tokens = texto.split(" ").map((palavra) => {
    if (!vocabulario[palavra]) {
      vocabulario[palavra] = index++;
    }
    return vocabulario[palavra];
  });
  return tokens;
}

// Função para treinar o modelo de Machine Learning
async function treinarModelo(dados) {
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

  // Preparar os dados de treinamento
  const xs = [];
  const ys = [];

  dados.forEach((exemplo) => {
    const [pergunta, resposta] = exemplo;

    // Tokeniza a pergunta
    const tokensPergunta = tokenizarTexto(pergunta[0]);

    // Prepara a resposta
    const respostaIndex =
      resposta[0] ===
      "Você pode criar uma função usando a palavra-chave 'function'."
        ? 0
        : 1; // Ajuste conforme necessário
    const target = tf.oneHot(respostaIndex, 2).arraySync(); // Convertendo para one-hot encoding

    // Certifique-se de que os tokens tenham o mesmo comprimento
    while (tokensPergunta.length < 20) tokensPergunta.push(0); // Padding para entrada

    // Adiciona os exemplos para o tensor
    xs.push(tokensPergunta);
    ys.push(target);
  });

  const xsTensor = tf.tensor2d(xs);
  const ysTensor = tf.tensor2d(ys);

  // Verifica se os tensores têm a forma correta antes do treinamento
  if (xsTensor.shape[1] !== 20) {
    throw new Error("As entradas precisam ter 20 características.");
  }
  if (ysTensor.shape[1] !== 2) {
    throw new Error("As saídas precisam ter 2 características.");
  }

  await model.fit(xsTensor, ysTensor, { epochs: 10 });

  // Salva o modelo
  await model.save(`file://model/tf_model`);

  return model;
}
async function preverSolucao(pergunta) {
  // Carrega o modelo salvo
  const model = await tf.loadLayersModel(`file://model/tf_model/model.json`);

  // Tokeniza a pergunta
  const tokensPergunta = tokenizarTexto(pergunta);

  // Preenche com zeros (padding) para garantir que tenha o tamanho correto
  while (tokensPergunta.length < 20) tokensPergunta.push(0);

  // Converte a pergunta em tensor
  const xsTensor = tf.tensor2d([tokensPergunta]);

  // Faz a previsão usando o modelo
  const previsao = model.predict(xsTensor);

  // Obtenha a classe mais alta
  const resposta = previsao.argMax(1).dataSync()[0]; // A classe prevista

  return `Sugestão de resposta: ${resposta}`;
}

module.exports = { treinarModelo, preverSolucao };
