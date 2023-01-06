/* eslint-disable */

require('dotenv').config({path: '.env'});
const { BinanceSpotClass } = require('../Classes/Exchanges/Binance/BinanceSpotClass.js');
const { TechnicalIndicatorClass } = require('../Classes/TechnicalIndicatorClass.js');
const sqlConnector = require('../DatabaseConnection/SQLConnector.js');


(async () => {

const ba = new BinanceSpotClass('binance');
await ba.loadExchange();
const trade = {
  symbol: 'BTCUSDT',
  side: 'buy',
  type: 'market',
  orderAmount: 1,
  price: 1,
  stopPrice: 1,
  limitPrice: 1,
  exchange: 'binance',
  strategy: 'Candle-Tree'
}

ba.createOrder(trade);
})();