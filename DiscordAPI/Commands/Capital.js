const {SlashCommandBuilder} = require('discord.js');
const {getExchanges} = require('../../Classes/Exchanges/ExchangesClass');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('capital')
      .setDescription('Fetch USDT capital'),
  async execute(interaction) {
    const excObj = getExchanges()['binanceFutures'].excObj;
    const capital = (await excObj.fetchBalance()).free.USDT;

    await interaction.reply(`El capital: $${capital}`);
  },
};
