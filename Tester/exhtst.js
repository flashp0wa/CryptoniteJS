/*eslint-disable*/

// require('dotenv').config({path: '../.env-dev'});
require('dotenv').config({path: '.env-dev'});
const _ = require('lodash');
const { BinanceSpotClass } = require('../Classes/Exchanges/Binance/BinanceSpotClass');
const { BinanceFuturesTestClass } = require('../Classes/Exchanges/Binance/BinanceFuturesTestClass');
const { getDatabase } = require('../Classes/Database');

const futuresTest = new BinanceFuturesTestClass('binanceFuturesTest');
const spot = new BinanceSpotClass('binanceSpot');
// const spotTest = new BinanceSpotTestClass('binanceSpotTest');

(async () => {
  try {
    const orderObj = {
      symbol: 'BTCUSDT',
      side: 'buy',
      type: 'market',
      orderAmount: 0.01,
      price: 24600,
      stopPrice: 20000,
      limitPrice: 27000,
      exchange: 'binanceFuturesTest',
      strategy: 'Candle-Tree-1.1',
    };
    await getDatabase().connect();
    await futuresTest.loadExchangeId();
    await futuresTest.loadMarkets();
    const res = await futuresTest.createOrder(orderObj);
    console.log(res);

} catch (error) {
  console.log(error);
}
})();
