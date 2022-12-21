/* eslint-disable */

require('dotenv').config({path: '.env'});
const { TechnicalIndicatorClass } = require('../Classes/TechnicalIndicatorClass.js');
const sqlConnector = require('../DatabaseConnection/SQLConnector.js');


(async () => {

  const kline1 = {
    closePrice: 3000,
    closeTime: '2022-12-21 22:22:22',
    symbol: 'BTCUSDT',
    timeFrame: '5m',
    closed: true,
  }
  const kline2 = {
    closePrice: 2000,
    closeTime: '2022-12-21 22:22:23',
    symbol: 'BTCUSDT',
    timeFrame: '5m',
    closed: true,
  }
  const kline3 = {
    closePrice: 1000,
    closeTime: '2022-12-21 22:22:24',
    symbol: 'BTCUSDT',
    timeFrame: '5m',
    closed: true,
  }
  const kline4 = {
    closePrice: 2000,
    closeTime: '2022-12-21 22:22:25',
    symbol: 'BTCUSDT',
    timeFrame: '5m',
    closed: true,
  }
  const kline5 = {
    closePrice: 3000,
    closeTime: '2022-12-21 22:22:26',
    symbol: 'BTCUSDT',
    timeFrame: '5m',
    closed: true,
  }
  const kline6 = {
    closePrice: 5000,
    closeTime: '2022-12-21 22:22:26',
    symbol: 'BTCUSDT',
    timeFrame: '5m',
    closed: true,
  }

  const ta = new TechnicalIndicatorClass();
  await ta.loadValues();
  console.log(ta.supportResistance);
  console.log(ta.averageTrueRange);

})();