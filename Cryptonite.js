'use strict';
require('dotenv').config({path: '.env'});
const {loadEventListeners} = require('./Loaders/Events.js');
const {getExchanges} = require('./Classes/Exchanges/ExchangesClass');
const {startApi} = require('./API/Api.js');
const {startIntervals} = require('./Intervals.js');
const {getTechnicalIndicators} = require('./Classes/TechnicalIndicatorClass.js');
// const streamFunc = require('./Streams/WssStreamHandler/StreamFunctions.js');

(async () => {
  await getExchanges().loadAllMarkets();
  await getTechnicalIndicators().loadValues();
  loadEventListeners();
  startApi();
  startIntervals();
  // streamFunc.startStream();
})();


