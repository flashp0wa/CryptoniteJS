const ccxt = require('ccxt');
const {singleRead} = require('../DatabaseConnection/SQLConnector.js');

const dataBank = new Map();
/**
 *
 * @param {string} exch
 * @return {Map}
 */
async function pwCoinSellState(exch) {
  if (exch === 'load') {
    const pw_coinSellState = new Map();
    const query = `SELECT * FROM PriceWatch`;
    const results = await singleRead(query);

    for (const stuff of results.recordset) {
      pw_coinSellState.set(stuff.Symbol, stuff.Sold);
    }
    dataBank.set('pw_CoinSellState', pw_coinSellState);
  } else if (exch === 'get') {
    return dataBank.get('pw_CoinSellState');
  }
}

/**
 *
 * @param {string} exch
 * @param {string} symbol
 * @param {number} price
 * @return {number}
 */
async function lastSellOrderCost(exch, symbol, price) {
  switch (exch) {
    case 'load':
      const lastSellOrderCost = new Map();
      const query = `with RowNum as (
        select Symbol, Cost,
          row_number() over (partition by Symbol order by EventTime desc) as RowNumb
        from Orders
        where Status = 'closed' and Side = 'sell'
      )
      
      select Symbol, Cost from RowNum
      where RowNumb ='1'`;
      const results = await singleRead(query);

      for (const stuff of results.recordset) {
        lastSellOrderCost.set(stuff.Symbol, stuff.Cost);
      }
      dataBank.set('lastSellOrderCost', lastSellOrderCost);
      break;
    case 'get':
      return dataBank.get('lastSellOrderCost').get(symbol);
    case 'set':
      dataBank.set(symbol, price);
      break;

    default:
  }
}

/**
 *
 * @param {string} exch
 * @return {Object} // returns exchange object
 */
function getCcxtExchange(exch) {
  async function loadExchanges() {
    const excMap = new Map();
    const excArr = [
      'binance',
      'coinbase',
      'ftx',
      'kraken',
      'kucoin',
      'huobi',
      'gemini',
      'bitfinex',
      'bitstamp',
      'coincheck',
      'bitflyer',
      'bybit',
      'okex',
      'coinone',
      'poloniex',
    ];

    excArr.forEach(async (exc) => {
      const newExc = new ccxt[exc]();
      await newExc.loadMarkets();

      // Config exchange
      switch (exc) {
        case 'binance':
          newExc.apiKey = process.env.BNC_APIKEY;
          newExc.secret = process.env.BNC_SECKEY;
          newExc.options.adjustForTimeDifference = true;
          newExc.options["warnOnFetchOpenOrdersWithoutSymbol"] = false; // Call open orders without symbol once per 10 sec
          excMap.set(exc, newExc);

          const bncTst = 'binance';
          const binanceTest = new ccxt[bncTst]();
          binanceTest.apiKey = process.env.BNCT_APIKEY;
          binanceTest.secret = process.env.BNCT_SECKEY;
          binanceTest.set_sandbox_mode(true);
          binanceTest.options["warnOnFetchOpenOrdersWithoutSymbol"] = false; // Call open orders without symbol once per 10 sec
          binanceTest.options.adjustForTimeDifference = true;
          excMap.set('binance-test', binanceTest);
          break;

        default:
          excMap.set(exc, newExc);
          break;
      }
    });

    dataBank.set('exchanges', excMap);
  }

  switch (exch) {
    case 'all':
      return dataBank.get('exchanges');
    case 'load':
      loadExchanges();
      break;
    default:
      return dataBank.get('exchanges').get(exch);
  }
}


async function loadDataBank() {
  getCcxtExchange('load');
  await pwCoinSellState('load');
  await lastSellOrderCost('load');
}


module.exports = {
  loadDataBank,
  pwCoinSellState,
  lastSellOrderCost,
  getCcxtExchange,
};
