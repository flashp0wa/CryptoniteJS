'use strict';
require('dotenv').config({path: '.env'});
const {loadEventListeners} = require('./Loaders/Events.js');
const {getExchanges} = require('./Classes/Exchanges/ExchangesClass');
const {startApi} = require('./API/Api.js');
const {startIntervals} = require('./Intervals.js');
const {getTechnicalIndicators} = require('./Classes/TechnicalIndicatorClass.js');
const {loadDiscordApi, getServerChannel} = require('./DiscordAPI/DiscordBot.js');

(async () => {
  await getExchanges().loadExchanges();
  await getTechnicalIndicators().loadValues();
  await loadDiscordApi();
  loadEventListeners();
  startApi();
  startIntervals();
  // getExchanges().binance.startWss();
  getServerChannel(process.env.DSCRD_CHNL_THEFIELD).send('Application online, let the money shower!');
})();


