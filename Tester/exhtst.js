/*eslint-disable*/

require('dotenv').config({path: '.env'});
const _ = require('lodash');
const ccxt = require('ccxt');

const bncTst = 'binance';
const binanceTst = new ccxt.pro.binance();
binanceTst.set_sandbox_mode(true);
binanceTst.apiKey = process.env.BNCT_APIKEY;
binanceTst.secret = process.env.BNCT_SECKEY;
binanceTst.options.adjustForTimeDifference = true;
binanceTst.options["warnOnFetchOpenOrdersWithoutSymbol"] = false; // Call all open orders only 1 / 10 seconds


console.log(ccxt.version);


(async () => {
  
  // console.log(await binanceTst.watchMyTrades('XRPUSDT'));
  // const res = await binanceTst.fetchFreeBalance();
  // const res = await binanceTst.fetchTicker('ADAUSDT');
  // console.log(res);
  // await binanceTst.createOrder('LUNAUSDT', 'stop_loss_limit', 'sell', 0.5, 29, {'stopPrice': 31})
  // binanceTst.createLimitSellOrder(symbol, amount, price)
  // const markets = await binanceTst.loadMarkets();
  // const res = binanceTst.symbols
  // console.log(markets['ETH/BTC'].info.filters);

  // await binanceTst.createLimitSellOrder('BTCUSDT', 0.2, 50000)
  // await binanceTst.createLimitSellOrder('XRPUSDT', 100, 1)
  // await binanceTst.createLimitSellOrder('ETHUSDT', 0.2, 3000)
  // const openOrders = await binanceTst.fetchOpenOrders();
  
  // binanceTst.defineRestApi()

  // await binanceTst.loadMarkets();

  // const rees = binanceTst.priceToPrecision('XRPUSDT', 0.45898);
  // console.log(rees);
  
  // const res = await binance.privatePostOrderOco({
  //   symbol: 'XRPUSDT',
  //   side: 'sell',
  //   quantity: 20,
  //   price: 0.48,
  //   stopPrice: 0.35,
  //   stopLimitPrice: 0.37,
  //   stopLimitTimeInForce: 'GTC'
  // })
  // console.log(res);

  // binanceTst.createLimitOrder(symbol, side, amount, price)
  // console.log(binanceTst.name);
  // binanceTst.fetchp
  // console.log(await getExchanges().binanceTest.exchangeObj.loadMarkets())   
  // market = await exchange.loadMarkets();

  // console.log(bncTst)
  
// const res = await binanceTst.limit
//await binanceTst.loadMarkets()
// console.log(await binanceTst.fetchClosedOrders());

})();




