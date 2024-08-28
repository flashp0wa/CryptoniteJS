/*eslint-disable*/

// require('dotenv').config({path: '../.env-dev'});
require('dotenv').config({path: '.envbkp'});
const _ = require('lodash');
const { BinanceSpotClass } = require('../Classes/Exchanges/Binance/BinanceSpotClass');
const { BinanceFuturesTestClass } = require('../Classes/Exchanges/Binance/BinanceFuturesTestClass');
const { getDatabase } = require('../Classes/Database');
// const { loadEventListeners } = require('../Loaders/Events');
const { getExchanges } = require('../Classes/Exchanges/ExchangesClass');

const futuresTest = new BinanceFuturesTestClass('binanceFuturesTest');
const spot = new BinanceSpotClass('binanceSpot');
// const spotTest = new BinanceSpotTestClass('binanceSpotTest');

(async () => {
  try {
    
      while (true) {
        console.log('enter');
          try {
              const trades = await spot.excObj.watchMyTrades('SOLUSDT')
              console.log (new Date (), trades)
          } catch (e) {
              console.log (e)
              // stop the loop on exception or leave it commented to retry
              // throw e
          }
    }
    // const orderObj = {
    //   symbol: 'BTCUSDT',
    //   side: 'buy',
    //   type: 'limit',
    //   orderAmount: 0.01,
    //   price: 26600,
    //   stopPrice: 20000,
    //   limitPrice: 32000,
    //   exchange: 'binanceFuturesTest',
    //   strategy: 'Candle-Tree-1.1',
    // };
    // loadEventListeners();
    // await getDatabase().connect();
    // await getExchanges().loadExchanges();
    // await futuresTest.loadExchangeId();
    // await futuresTest.loadMarkets();
    // await futuresTest.loadOpenOrders();
    // const res = await futuresTest.createOrder(orderObj);

    // const res = await futuresTest.excObj.fetchOrder('3305896329', 'BTCUSDT');

    console.log(res);
    // setInterval(() => {
    //   futuresTest.openOrders.checkSupportOrder();
    // }, 10000);


} catch (error) {
  console.log(error);
}
})();
