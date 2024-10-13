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

    // Verifica se a mensagem é sobre GitHub
    if (mensagem.startsWith("github")) {
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

    // Verifica se a mensagem é para treinar o modelo
    else if (mensagem.startsWith("train model")) {
      try {
        await treinarModelo(); // Treina o modelo com TensorFlow.js
        await context.sendActivity("Modelo treinado com sucesso!");
      } catch (error) {
        await context.sendActivity("Ocorreu um erro ao treinar o modelo.");
      }
    }

    // Se não for sobre GitHub ou treinar modelo, processa o NLP e usa o modelo de ML
    else {
      try {
        // Passo 1: Processa a mensagem com o NLP
        const nlpResult = await processarNLP(mensagem);

        // Passo 2: Verifica a intenção com o NLP
        if (nlpResult.intencao === "erro_codigo") {
          // Passo 3: Usa o Machine Learning para prever uma solução com base na intenção detectada
          const sugestaoML = await preverSolucao(nlpResult.entidade);

          // Passo 4: Retorna a sugestão da previsão do modelo
          await context.sendActivity(`Sugestão para o erro: ${sugestaoML}`);
        } else {
          // Caso não seja um erro de código, apenas responde com o resultado do NLP
          await context.sendActivity(
            `Entendi que você quis dizer: ${JSON.stringify(nlpResult)}`
          );
        }
      } catch (error) {
        await context.sendActivity(
          "Desculpe, não consegui processar sua mensagem."
        );
      }
    }
  }
};

module.exports = { adapter, botLogic }; // Exporta o adaptador e a lógica do bot
