const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {ApiLog} = require('../../Toolkit/Logger.js');
const _ = require('lodash');
const {getExchanges} = require('../../Classes/Exchanges/ExchangesClass');
const {binanceHistoryData} = require('../../Toolkit/BncHistoryDownload.js');
const {sproc_GatherSymbolTAData} = require('../../DatabaseConnection/SQLConnector.js');


router.route('/:exchange/getSymbols').get((req, res) => {
  try {
    const symbols = getExchanges()[req.params.exchange].symbolList;
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

router.route('/binance/historyDataDownload').post(async (req, res) => {
  binanceHistoryData(req.body);
});

router.route('/binance/coinTAData').post(async (req, res) => {
  const result = await sproc_GatherSymbolTAData(req.body);
  res.send(result);
});

module.exports = router;
