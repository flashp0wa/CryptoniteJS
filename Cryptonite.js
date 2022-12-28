'use strict';
require('dotenv').config({path: '.env'});
const {loadEventListeners} = require('./Loaders/Events.js');
const {getExchanges} = require('./Classes/Exchanges/ExchangesClass');
const {startApi} = require('./API/Api.js');
const {startIntervals} = require('./Intervals.js');
const {getTechnicalIndicators} = require('./Classes/TechnicalIndicatorClass.js');

(async () => {
  await getExchanges().loadExchange();
  await getTechnicalIndicators().loadValues();
  loadEventListeners();
  startApi();
  startIntervals();
  // getExchanges().binance.startWss();
})();


