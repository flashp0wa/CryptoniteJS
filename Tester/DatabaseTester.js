/* eslint-disable */

// require('dotenv').config({path: '../.env'});
require('dotenv').config({path: '.envbkp'});
const { getDatabase } = require('../Classes/Database.js');
const { BinanceSpotClass } = require('../Classes/Exchanges/Binance/BinanceSpotClass.js');
const db = getDatabase();

(async () => {
  await db.connect();

  const dataObj = {
    exchange: 'binanceFutures',
    symbol: 'BTCUSDT',
    timeFrame: '1d',
    type: 'market',
    side: 'buy',
    orderAmount: '100',
    price: '222',
    limitPrice: '333',
    stopPrice: '111',
    stopLimitPrice: '111',
    strategy: '1',
    isPostOnly: true,
    options: {
      cashbackTrail: '30'
    },
  };
  const response = await db.singleRead(`select * from itvf_GetLastKlineOpenTime('1')`);
  console.log(response);

  response.forEach(element => {
    console.log(element.symbol);
  });

  // const res = await db.pushJson(dataObj, 'NI_CreateOrder');
  // console.log(res);

})();

  