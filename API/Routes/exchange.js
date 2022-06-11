const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {ApiLog} = require('../../Toolkit/Logger.js');
const _ = require('lodash');
const {getExchanges} = require('../../Classes/Exchanges/ExchangesClass');
const {downloadHistoryData} = require('../../Toolkit/BncHistoryDownload.js');

// const app = express();

router.route('/:exchange/getSymbols').get(async (req, res) => {
  try {
    const symbols = [];
    const markets = await getExchanges()[req.params.exchange].exchangeObj.markets;
    for (const market of Object.keys(markets)) {
      symbols.push(markets[market].info.symbol);
    }
    res.send(symbols);
  } catch (error) {
    ApiLog.error(`Could not retrieve symbols. ${error}`);
  }
});

router.route('/:exchange/getAccountInfo').get(async (req, res) => {
  try {
    const exchange = getExchanges();
    const balance = await exchange[req.params.exchange].exchangeObj.fetchBalance();
    const openOrders = await exchange[req.params.exchange].exchangeObj.fetchOpenOrders();
    const response = {};
    response.free = balance.free;
    response.used = balance.used;
    response.openOrders = openOrders;
    res.send(response);
  } catch (error) {
    ApiLog.error(`Could not retrieve account info. ${error}`);
  }
});

router.route('/:exchange/cancelOrders/:symbol').get(async (req, res) => {
  try {
    const exchange = getExchanges()[req.params.exchange].exchangeObj;
    const openOrders = await exchange.fetchOpenOrders();

    if (req.params.symbol === 'all') {
      const symbols = [];
      for (const order of openOrders) {
        symbols.push(order.info.symbol);
      }
      const uniqueSymbols = _.uniq(symbols);
      for (const symbol of uniqueSymbols) {
        exchange.cancelAllOrders(symbol);
      }
      ApiLog.info('All orders have been canceled.');
    } else {
      exchange.cancelAllOrders(req.params.symbol);
      ApiLog.info(`Orders for ${req.params.symbol} has been canceled.`);
    }
  } catch (error) {
    ApiLog.error(`Cannot cancel orders. ${error}`);
  }
});

router.route('/binance/historyDataDownload').post((req, res) => {
  downloadHistoryData(req.body);
  res.send('Download started');
});

// app.use('/', router);
module.exports = router;
