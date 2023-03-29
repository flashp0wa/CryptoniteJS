// const queryProcessor = require('./DatabaseConnection/QueryProcessor.js');
const {getExchanges} = require('./Classes/Exchanges/ExchangesClass.js');
const {getTimeBetweenDates} = require('./Toolkit/OnDateOperations.js');
const {ApplicationLog} = require('./Toolkit/Logger.js');
/**
 * // Strats automatic processes
 */
function startIntervals() {
  // #region DatabaseOperations

  // const symbolArray = [
  //   'adausdt', 'btcusdt', 'ethusdt', 'dotusdt',
  //   'lunausdt', 'dashusdt', 'vetusdt', 'bnbusdt',
  //   'dogeusdt', 'solusdt', 'uniusdt', 'linkusdt',
  //   'ltcusdt', 'lunausdt', 'maticusdt', 'xlmusdt',
  // ];

  // const loHiAvgTTQAV = queryProcessor.totalTradedQuoteAssetVolume('LoHiAvgTTQAV');
  // setInterval(async () => {
  //   console.log(await loHiAvgTTQAV(symbolArray));
  // }, 600000);

  // setInterval(async () => {
  //   console.log(await queryProcessor.simpleMovingAverage(symbolArray));
  // }, 600000);
  // Elapsed Time Between Increase Decrease TTQAV Price (ETBIDTP)
  //  const reFunction = queryProcessor.totalTradedQuoteAssetVolume('ETBIDTP');
  //  let result = await reFunction();
  //  console.log(`Highest increase time: ${result.HighestIncreaseTime}`);
  //  console.log(`Highest decrease time: ${result.HighestDecreaseTime}`);
  // clearInterval(tradingVolumeIntervals)

  // #endregion
  setInterval(() => {
    getExchanges().reloadMarkets();
  }, process.env.RELOAD_MARKETS);

  setInterval(() => {
    getExchanges().checkOrderStatus();
  }, process.env.CHECK_ORDER_STATUS);

  setInterval(() => {
    getExchanges().checkSupportOrderStatus();
  }, process.env.CHECK_SUPPORT_ORDER);

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
