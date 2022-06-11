require('dotenv').config({path: '.env'});
const {loadEventListeners} = require('./Loaders/Events.js');
const {getExchanges} = require('./Classes/Exchanges/ExchangesClass');
const {startApi} = require('./API/Api.js');
const {startIntervals} = require('./Intervals.js');
// const streamFunc = require('./Streams/WssStreamHandler/StreamFunctions.js');

(async () => {
  await getExchanges().loadAllMarkets();
  loadEventListeners();
  startApi();
  startIntervals();
  // streamFunc.startStream();
  // queryProcessor.onBalanceVolume();
})();


