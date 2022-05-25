/*eslint-disable*/

require('dotenv').config({path: '.env'});
const _ = require('lodash');
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

  // await binanceTest.createLimitSellOrder('BTCUSDT', 0.2, 50000)
  // await binanceTest.createLimitSellOrder('XRPUSDT', 100, 1)
  // await binanceTest.createLimitSellOrder('ETHUSDT', 0.2, 3000)
  // const openOrders = await binanceTest.fetchOpenOrders();
  
  // binanceTest.defineRestApi()

  await binanceTest.loadMarkets();

  const rees = binanceTest.priceToPrecision('XRPUSDT', 0.45898);
  console.log(rees);
  
  const res = await binanceTest.privatePostOrderOco({
    symbol: 'XRPUSDT',
    side: 'sell',
    quantity: 200,
    price: 0.45,
    stopPrice: binanceTest.priceToPrecision('XRPUSDT',0.39123),
    stopLimitPrice: binanceTest.priceToPrecision('XRPUSDT', 0.37123),
    stopLimitTimeInForce: 'GTC'

  })
  console.log(res);

  binanceTest.createLimitOrder(symbol, side, amount, price)

  binanceTest.crea
  
})();
