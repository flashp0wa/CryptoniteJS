'use strict';


require('dotenv').config({path: '.env-dev'});
(async () => {
  // const {loadDiscordApi} = require('./DiscordAPI/DiscordBot');
  // await loadDiscordApi();
  const {getDatabase} = require('./Classes/Database');
  const {ApplicationLog} = require('./Toolkit/Logger');
  const {loadEventListeners} = require('./Loaders/Events');
  const {getExchanges} = require('./Classes/Exchanges/ExchangesClass');
  const {startApi} = require('./API/Api');
  const {startIntervals} = require('./Intervals');

  await getDatabase().connect();
  await getExchanges().loadExchanges();
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
})();
