const fs = require("fs");
const tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-node");

// Função para tokenizar o texto (converte strings em vetores de números)
function tokenizarTexto(texto) {
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

// Função para carregar dados de treinamento
function carregarDados() {
  const dadosRaw = fs.readFileSync("model/data.json");
  const dados = JSON.parse(dadosRaw);
  return dados.map((item) => [[item.pergunta], [item.resposta]]);
}

// Função para adicionar novos dados
function adicionarDados(novaPergunta, novaResposta) {
  const dados = carregarDados();
  dados.push([{ pergunta: novaPergunta, resposta: novaResposta }]);
  fs.writeFileSync("model/data.json", JSON.stringify(dados, null, 2));
}

// Função para treinar o modelo de Machine Learning
async function treinarModelo() {
  const dados = carregarDados();
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

  const xs = [];
  const ys = [];
  const respostas = dados.map((item) => item[0][1]); // Extrair respostas para o dicionário

  dados.forEach((exemplo, index) => {
    const [pergunta, resposta] = exemplo;
    const tokensPergunta = tokenizarTexto(pergunta[0]);

    // Usa o índice da resposta para criar o vetor de saída
    const target = tf.oneHot(index, respostas.length).arraySync(); // Um-hot encoding para todas as respostas

    while (tokensPergunta.length < 20) tokensPergunta.push(0); // Padding para entrada

    xs.push(tokensPergunta);
    ys.push(target);
  });

  const xsTensor = tf.tensor2d(xs);
  const ysTensor = tf.tensor2d(ys);

  if (xsTensor.shape[1] !== 20) {
    throw new Error("As entradas precisam ter 20 características.");
  }
  if (ysTensor.shape[1] !== respostas.length) {
    throw new Error(
      `As saídas precisam ter ${respostas.length} características.`
    );
  }

  await model.fit(xsTensor, ysTensor, { epochs: 10 });
  await model.save(`file://model/tf_model`);

  return model;
}

// Função para prever uma solução com base no modelo treinado
async function preverSolucao(pergunta) {
  const model = await tf.loadLayersModel(`file://model/tf_model/model.json`);
  const tokensPergunta = tokenizarTexto(pergunta);

  while (tokensPergunta.length < 20) tokensPergunta.push(0);
  const xsTensor = tf.tensor2d([tokensPergunta]);

  const previsao = model.predict(xsTensor);
  const respostaIndex = previsao.argMax(1).dataSync()[0];

  // Lê as respostas para retornar a resposta correta
  const dados = carregarDados();
  const respostaCorreta = dados[respostaIndex][0][1];

  return respostaCorreta; // Retorna a resposta correspondente
}

// Exportando funções
module.exports = { treinarModelo, preverSolucao, adicionarDados };
