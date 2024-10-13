const server = require("./config/server"); // Importa o servidor
const { adapter, botLogic } = require("./bot/bot"); // Importa o adaptador e a lógica do bot

// Configura a rota para receber mensagens do bot
server.post("/api/messages", (req, res, next) => {
  adapter
    .processActivity(req, res, async (context) => {
      // Lógica do bot
      await botLogic(context);
    })
    .then(() => {
      // Não envie a resposta novamente se já foi enviada
      if (!res.headersSent) {
        next();
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      // Enviar uma resposta de erro e chamar next() somente se necessário
      if (!res.headersSent) {
        res.send(500, err.message);
        next();
      }
    });
});
