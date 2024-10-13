const axios = require("axios");

// Função para buscar informações de repositórios no GitHub
async function buscarRepoGitHub(nomeRepo) {
  const response = await axios.get(`https://api.github.com/repos/${nomeRepo}`);
  return response.data;
}

module.exports = { buscarRepoGitHub }; // Exporta a função para ser usada no bot
