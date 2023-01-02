// const queryProcessor = require('./DatabaseConnection/QueryProcessor.js');
const {getExchanges} = require('./Classes/Exchanges/ExchangesClass.js');
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
  }, 300000);

  setInterval(() => {
    getExchanges().checkOrderStatus();
  }, 10000);
}


module.exports = {
  startIntervals,
};
