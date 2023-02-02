const {SlashCommandBuilder} = require('discord.js');
const {getExchanges} = require('../../Classes/Exchanges/ExchangesClass');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('balance')
      .setDescription('Fetch balance'),
  async execute(interaction) {
    const excObj = getExchanges()['binanceFutures'].excObj;
    const capital = await excObj.fetchBalance();
    let reply;

    reply = '\`\`\`yaml\n';
    reply += '<---Free---> \n';

    for (const [key, value] of Object.entries(capital.free)) {
      reply += `${key} : ${value}\n`;
    }

    reply += '<---Used---> \n';
    for (const [key, value] of Object.entries(capital.used)) {
      reply += `${key} : ${value}\n`;
    }

    reply += '<---Total---> \n';
    for (const [key, value] of Object.entries(capital.total)) {
      reply += `${key} : ${value}\n`;
    }
    reply += '\`\`\`';
    await interaction.reply(reply);
  },
};
