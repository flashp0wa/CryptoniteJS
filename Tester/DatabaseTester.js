/* eslint-disable */

// require('dotenv').config({path: '../.env'});
require('dotenv').config({path: '.env'});
const { BinanceSpotClass } = require('../Classes/Exchanges/Binance/BinanceSpotClass.js');
const { getTechnicalIndicators } = require('../Classes/TechnicalIndicatorClass.js');
const sqlConnector = require('../DatabaseConnection/SQLConnector.js');

(async () => {
  const symbol = 'BTCUSDT';
  const timeframe = '5m'
  const res = await sqlConnector.singleRead(`select * from itvf_GetLastKlineOpenTime('${symbol}', '${timeframe}')`);
  console.log(res);
})();

