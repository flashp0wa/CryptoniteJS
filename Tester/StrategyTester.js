require('dotenv').config({path: '.env'});
const {StrategyClass} = require('../Classes/StrategyClass');
const ccxt = require('ccxt');
const {loadEventListeners} = require('../Loaders/Events');
const {getExchanges} = require('../Classes/Exchanges/ExchangesClass');

const binance = new ccxt.pro.binanceusdm;
binance.apiKey = process.env.BNCFT_APIKEY;
binance.secret = process.env.BNCFT_SECKEY;
binance.options.adjustForTimeDifference = true;
binance.options['warnOnFetchOpenOrdersWithoutSymbol'] = false; // Call all open orders only 1 / 10 seconds
binance.set_sandbox_mode(true);
binance.name = 'binance-futures-test';

loadEventListeners();
(async () => {
  await getExchanges().loadExchanges();
  const StrategyClassObj = new StrategyClass(binance, 'binanceFuturesTest');

  const srObj = {
    'BTCUSDT': {
      '5m': {
        support: 15900,
        resistance: 20000,
      },
    },
  };

  const atrObj = {
    'BTCUSDT': {
      '5m': {
        currentAtr: 50,
      },
    },
  };

  StrategyClassObj.technicalIndicators.averageTrueRange = atrObj;
  StrategyClassObj.technicalIndicators.supportResistance = srObj;

  const kline5 = {
    symbol: 'BTCUSDT',
    timeFrame: '5m',
    closed: true,
    openPrice: 19000,
    closePrice: 19100,
    lowPrice: 18900,
    highPrice: 19600,
    candleTypeId: 5,
  };
  const kline4 = {
    symbol: 'BTCUSDT',
    timeFrame: '5m',
    closed: true,
    openPrice: 19100,
    closePrice: 19200,
    lowPrice: 19000,
    highPrice: 19700,
    candleTypeId: 5,
  };
  const kline3 = {
    symbol: 'BTCUSDT',
    timeFrame: '5m',
    closed: true,
    openPrice: 19200,
    closePrice: 19300,
    lowPrice: 19100,
    highPrice: 19800,
    candleTypeId: 1,
  };
  const kline2 = {
    symbol: 'BTCUSDT',
    timeFrame: '5m',
    closed: true,
    openPrice: 19300,
    closePrice: 19400,
    lowPrice: 19200,
    highPrice: 19000,
    candleTypeId: 6,
  };
  const kline1 = {
    symbol: 'BTCUSDT',
    timeFrame: '5m',
    closed: true,
    openPrice: 19400,
    closePrice: 19500,
    lowPrice: 19300,
    highPrice: 20000,
    candleTypeId: 4,
  };

  async function kick() {
    StrategyClassObj.supportResistanceCandleTree(kline1);
    StrategyClassObj.supportResistanceCandleTree(kline2);
    StrategyClassObj.supportResistanceCandleTree(kline3);
    setTimeout(() => {
      StrategyClassObj.supportResistanceCandleTree(kline4);
    }, 5000);
  }

  kick();
})();
