const { BotFrameworkAdapter } = require("botbuilder");
const { processarNLP } = require("../services/nlpService"); // Serviço de NLP
const { buscarRepoGitHub } = require("../services/githubService"); // Serviço da API GitHub
const {
  treinarModelo,
  preverSolucao,
  adicionarDados,
} = require("../services/mlModel"); // Treinamento e previsão de ML

// Configuração do adaptador do bot
const adapter = new BotFrameworkAdapter({
  appId: "39e88937-e7e1-405b-81ba-20a9fdd212df", // Use variáveis de ambiente
  appPassword: "XYn8Q~uVI~n3b_pya3yPGQAO1KXK7R3zfR-hYbc3",
});

// Função principal do bot
const botLogic = async (context) => {
  if (context.activity.type === "message") {
    const mensagem = context.activity.text.trim();

    // Verifica se a mensagem é para treinar o modelo
    if (mensagem.startsWith("train model")) {
      const trainingData = JSON.parse(mensagem.slice(11).trim()); // Captura o que vem após "train model"

      try {
        // Adiciona novos dados ao arquivo JSON
        trainingData.forEach((item) => {
          const pergunta = item[0][0];
          const resposta = item[1][0];
          adicionarDados(pergunta, resposta); // Adiciona dados
        });

        // Treina o modelo com os dados atualizados
        await treinarModelo(carregarDados());
        await context.sendActivity("Modelo treinado com os dados fornecidos!");
      } catch (error) {
        console.error("Erro ao treinar o modelo:", error);
        await context.sendActivity(
          "Ocorreu um erro ao treinar o modelo. Detalhes: " + error.message
        );
      }
    }

    // Outras funções do bot
    else if (mensagem.startsWith("github")) {
      const nomeRepo = mensagem.split(" ")[1];

      try {
        const repoInfo = await buscarRepoGitHub(nomeRepo);
        await context.sendActivity(
          `Repositório ${repoInfo.full_name}: ${repoInfo.description}`
        );
      } catch (error) {
        await context.sendActivity(
          "Desculpe, não consegui encontrar o repositório."
        );
      }
    }

    // Processa a mensagem com o NLP e prevê uma solução
    else {
      try {
        const nlpResult = await processarNLP(mensagem);
        const sugestaoML = await preverSolucao(nlpResult);
        await context.sendActivity(`Sugestão: ${sugestaoML}`);
      } catch (error) {
        await context.sendActivity(
          "Desculpe, não consegui processar sua mensagem."
        );
      }
    }
  }
};

module.exports = { adapter, botLogic }; // Exporta o adaptador e a lógica do bot
