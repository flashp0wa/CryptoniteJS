'use strict';
require('dotenv').config({path: '.env'});
(async () => {
  const {loadDiscordApi} = require('./DiscordAPI/DiscordBot');
  await loadDiscordApi();

  const {ApplicationLog} = require('./Toolkit/Logger');
  const {loadEventListeners} = require('./Loaders/Events');
  const {getExchanges} = require('./Classes/Exchanges/ExchangesClass');
  const {startApi} = require('./API/Api');
  const {startIntervals} = require('./Intervals');
  const {getTechnicalIndicators} = require('./Classes/TechnicalIndicatorClass');

  await getExchanges().loadExchanges();
  await getTechnicalIndicators().loadValues();
  loadEventListeners();
  startIntervals();
  startApi();
  getExchanges().binanceFutures.startWss();
  ApplicationLog.log({
    level: 'info',
    message: 'Application online, let the money shower!',
    senderFunction: 'Crypt0nite',
    file: 'Cryptonite.js',
    discord: 'gumiszoba',
  });
})();
