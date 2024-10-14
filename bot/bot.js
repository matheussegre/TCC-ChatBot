const { BotFrameworkAdapter } = require("botbuilder");
const { processarNLP } = require("../services/nlpService"); // Serviço de NLP
const { buscarRepoGitHub } = require("../services/githubService"); // Serviço da API GitHub
const { treinarModelo, preverSolucao } = require("../services/mlModel"); // Treinamento e previsão de ML

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
      try {
        // Formatação dos dados para treinamento
        const trainingData = mensagem.slice(11).trim(); // Captura o que vem após "train model"
        const parsedData = JSON.parse(trainingData); // Converte string para array de arrays

        // Verifica se o dado foi convertido corretamente
        if (!Array.isArray(parsedData)) {
          throw new Error(
            "Os dados de treinamento precisam ser um array de arrays."
          );
        }

        // Chama a função de treinamento com os dados convertidos
        await treinarModelo(parsedData);
        await context.sendActivity("Modelo treinado com sucesso!");
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
