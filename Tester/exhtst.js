require('dotenv').config({path: '.env'});
const ccxt = require('ccxt');

const bncTst = 'binance';
const binanceTest = new ccxt[bncTst]();
binanceTest.set_sandbox_mode(true);
binanceTest.apiKey = process.env.BNCT_APIKEY;
binanceTest.secret = process.env.BNCT_SECKEY;
binanceTest.options.adjustForTimeDifference = true;
binanceTest.options["warnOnFetchOpenOrdersWithoutSymbol"] = false; // Call all open orders only 1 / 10 seconds

(async () => {
  // const res = await binanceTest.fetchFreeBalance();
  // const res = await binanceTest.fetchTicker('ADAUSDT');
  // console.log(res);
  // await binanceTest.createOrder('LUNAUSDT', 'stop_loss_limit', 'sell', 0.5, 29, {'stopPrice': 31})
  // binanceTest.createLimitSellOrder(symbol, amount, price)
  // const markets = await binanceTest.loadMarkets();
  // const res = binanceTest.symbols
  // console.log(markets['ETH/BTC'].info.filters);

  await binanceTest.cancelAllOrders('BTCUSDT');
  const stuff = await binanceTest.createLimitSellOrder('BTCUSDT', 0.00675, 54892)
  // const openOrders = await binanceTest.fetchOpenOrders();
  
  console.log(stuff);

})();
