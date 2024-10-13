const restify = require("restify");

// Cria o servidor Restify
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`Servidor rodando na porta ${server.url}`);
});

module.exports = server; // Exporta o servidor para ser usado no index.js
