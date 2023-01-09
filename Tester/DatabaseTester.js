/* eslint-disable */

require('dotenv').config({path: '.env'});
const { BinanceSpotClass } = require('../Classes/Exchanges/Binance/BinanceSpotClass.js');
const { TechnicalIndicatorClass } = require('../Classes/TechnicalIndicatorClass.js');
const sqlConnector = require('../DatabaseConnection/SQLConnector.js');


// (async () => {

// const ba = new BinanceSpotClass('binance');
// await ba.loadExchange();
// const trade = {
//   symbol: 'BTCUSDT',
//   side: 'buy',
//   type: 'market',
//   orderAmount: 1,
//   price: 1,
//   stopPrice: 1,
//   limitPrice: 1,
//   exchange: 'binance',
//   strategy: 'Candle-Tree'
// }

// ba.createOrder(trade);
// })();

const orderObj = {
  symbol: 'BTCUSDT',
  side: 'buy',
  type: 'market',
  orderAmount: 1000,
  price: 15000,
  stopPrice: 14000,
  limitPrice: 17000,
  exchange: 'binance',
  strategy: 'Candle-Tree',
  reason: 'Entry candle close price is higher than support level.'
};

sqlConnector.sproc_InsertIntoOrderFailed(orderObj);