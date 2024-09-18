// const queryProcessor = require('./DatabaseConnection/QueryProcessor.js');
const {getExchanges} = require('./Classes/Exchanges/ExchangesClass.js');
const {getTimeBetweenDates} = require('./Toolkit/OnDateOperations.js');
const {ApplicationLog} = require('./Toolkit/Logger.js');
/**
 * // Strats automatic processes
 */
function startIntervals() {
  // setInterval(() => {
  //   getExchanges()['binanceFutures'].strategy.pricefallTree = new Map();
  // }, 3600000);

  setInterval(() => {
    getExchanges().reloadMarkets();
  }, process.env.RELOAD_MARKETS);

  setInterval(() => {
    const lastWssMessageTimestamp = getExchanges()['binanceFutures'].lastWssMessageTimestamp;
    getExchanges()['binanceFutures'].wssOn = false;
    const timeDiff = getTimeBetweenDates(lastWssMessageTimestamp, new Date(), 'ms');
    if (timeDiff > process.env.WSS_TIMEOUT) {
      ApplicationLog.log({
        level: 'error',
        message: `Web Socket Client has not received any message for ${timeDiff} ms.`,
        senderFunction: 'Interval',
        file: 'Intervals.js',
        discord: 'application-errors',
      });
    }
  }, process.env.CHECK_WSS_CONNECTION);
}


module.exports = {
  startIntervals,
};
