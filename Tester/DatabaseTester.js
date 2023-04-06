/* eslint-disable */

// require('dotenv').config({path: '../.env'});
require('dotenv').config({path: '.envbkp'});
const { getDatabase } = require('../Classes/Database.js');
const { BinanceSpotClass } = require('../Classes/Exchanges/Binance/BinanceSpotClass.js');
const { getTechnicalIndicators } = require('../Classes/TechnicalIndicatorClass.js');
const db = getDatabase();

(async () => {
  await db.connect();

  async function loadEnv() {
    const res = await db.singleRead('select * from cry_setting_application');
    console.log(res);

  }

  await loadEnv();
  // const obj = {
  //   exchange: '\'BinanceFuturesTest\'',
  //   orderStatus: null,
  //   orderId: null,
  //   orderType: null,
  //   side: null,
  //   strategyId: null,
  //   startDate: null,
  //   endDate: null,
  // }

})();

