/* eslint-disable */

// require('dotenv').config({path: '../.env'});
require('dotenv').config({path: '.envbkp'});
const { getDatabase } = require('../Classes/Database.js');
const { BinanceSpotClass } = require('../Classes/Exchanges/Binance/BinanceSpotClass.js');
const { getTechnicalIndicators } = require('../Classes/TechnicalIndicatorClass.js');
const db = getDatabase();

(async () => {
  await db.connect();

  const obj = {
    openTime: '2023-07-10 00:00:00',
    openPrice: 30160.71000000,
    closePrice: 30411.57000000,
    highPrice: 31045.78000000,
    lowPrice: 29950.00000000,
    volume: 41262.8765,
    closeTime: '2023-07-10 23:59:59',
    quoteAssetVolume: 1254289037.7421,
    numberOfTrades: 896853,
    takerBuyBaseAssetVolume: 19574.2347,
    takerBuyQuoteAssetVolume: 595390893.145,
    ignore: 0,
    timeFrame: '1d',
    symbol: 'BTCUSDT',
    candleTypeId: 1,
  };


  async function loadEnv() {
    const res = await db.sproc_InsertIntoKlines(obj);    
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

