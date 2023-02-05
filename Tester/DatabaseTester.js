/* eslint-disable */

// require('dotenv').config({path: '../.env'});
require('dotenv').config({path: '.env-dev'});
const { BinanceSpotClass } = require('../Classes/Exchanges/Binance/BinanceSpotClass.js');
const { getTechnicalIndicators } = require('../Classes/TechnicalIndicatorClass.js');
const sqlConnector = require('../DatabaseConnection/SQLConnector.js');

(async () => {
  const obj = {
    exchange: '\'BinanceFuturesTest\'',
    orderStatus: null,
    orderId: null,
    orderType: null,
    side: null,
    strategyId: null,
    startDate: null,
    endDate: null,
  }

const resp = await sqlConnector.singleRead(`select * from itvf_FE_ReturnOrders(${obj.exchange}, ${obj.orderStatus}, ${obj.orderId}, ${obj.orderType}, ${obj.side}, ${obj.strategyId}, ${obj.startDate}, ${obj.endDate})`);
console.log(resp);
})();

