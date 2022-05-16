require('dotenv').config({path: '.env'});
const {loadEventListeners} = require('./Loaders/Events.js');
const {loadDataBank} = require('./Loaders/LoadDataBank.js');
const {startApi} = require('./Api.js');
const {startIntervals} = require('./Intervals.js');
// const streamFunc = require('./Streams/WssStreamHandler/StreamFunctions.js');

(async () => {
  await loadDataBank();
  loadEventListeners();
  startApi();
  startIntervals();
  // streamFunc.startStream();
  // queryProcessor.onBalanceVolume();
})();


