'use strict';
require('dotenv').config({path: '.env'});
const {load} = require('./LoadEnvironment');

async function start() {
  await load();
  const {ApplicationLog} = require('./Toolkit/Logger');
  const {loadEventListeners} = require('./Loaders/Events');
  const {getExchanges} = require('./Classes/Exchanges/ExchangesClass');
  const {startApi} = require('./API/Api');
  const {startIntervals} = require('./Intervals');
  await getExchanges().initialize();
  const {loadDiscordApi} = require('./DiscordAPI/DiscordBot');
  await loadDiscordApi();
  loadEventListeners();
  startIntervals();
  startApi();

  ApplicationLog.log({
    level: 'info',
    message: `Application online, let the money shower! | Trade Mode: ${process.env.CRYPTONITE_TRADE_MODE}`,
    senderFunction: 'Crypt0nite',
    file: 'Cryptonite.js',
    discord: 'gumiszoba',
  });
}

module.exports = {start};
