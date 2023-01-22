/* eslint-disable */

// require('dotenv').config({path: '../.env'});
require('dotenv').config({path: '.env-dev'});
const { BinanceSpotClass } = require('../Classes/Exchanges/Binance/BinanceSpotClass.js');
const { getTechnicalIndicators } = require('../Classes/TechnicalIndicatorClass.js');
const sqlConnector = require('../DatabaseConnection/SQLConnector.js');

(async () => {
const a = '{"eventTime":"2023-01-21T16:10:01.570Z","updateTime":"2023-01-21T16:10:01.570Z","orderId":"110135191643","symbol":"BTCUSDT","orderType":"stop_market","side":"sell","stopPrice":22859.6,"amount":0.005,"cost":0,"filled":0,"remaining":0.005,"timeInForce":"GTC","postOnly":false,"reduceOnly":false,"priceProtect":false,"workingType":"CONTRACT_PRICE","positionSide":"BOTH","orderStatus":"open","tradeStatus":"NEW","exchange":"binanceFutures","oco":false,"ocoLimitId":null,"ocoStopLossLimitId":null,"parentOrderId":"110135187011","siblingOrderId":"110135197614","strategy":"Candle-Tree","fee":null}'
await sqlConnector.sproc_InsertIntoOrder(JSON.parse(a));
})();

