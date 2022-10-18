const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {ApiLog, ApplicationLog} = require('../../Toolkit/Logger.js');
const _ = require('lodash');
const {getExchanges} = require('../../Classes/Exchanges/ExchangesClass');
const {downloadHistoryData} = require('../../Toolkit/BncHistoryDownload.js');

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
  let counter = 0;
  const klinesArr = [
    '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1mo',
  ];

  if (req.body.symbol === 'all' && req.body.klinesTimeFrame === 'all') {
    const symbols = [...getExchanges()['binance'].symbolList];
    for (const symbol of symbols) {
      for (const kline of klinesArr) {
        counter++;
        ApplicationLog.info(`Current: ${counter} / ${symbols.length * klinesArr.length}`);
        req.body.symbol = symbol;
        req.body.klinesTimeFrame = kline;
        await downloadHistoryData(req.body);
      }
    }
  } else if (req.body.symbol === 'all') {
    const symbols = [...getExchanges()['binance'].symbolList];
    for (const symbol of symbols) {
      counter++;
      ApplicationLog.info(`Current: ${counter} / ${symbols.length}`);
      req.body.symbol = symbol;
      await downloadHistoryData(req.body);
    }
  } else if (req.body.symbol === 'allUSDT') {
    const symbols = [...getExchanges()['binance'].symbolList];
    for (const symbol of symbols) {
      counter++;
      ApplicationLog.info(`Current: ${counter} / ${symbols.length}`);
      if (symbol.match(/.*USDT/)) {
        req.body.symbol = symbol;
        await downloadHistoryData(req.body);
      }
    }
  } else if (req.body.klinesTimeFrame === 'all') {
    for (const kline of klinesArr) {
      counter++;
      ApplicationLog.info(`Current: ${counter} / ${klinesArr.length}`);
      req.body.klinesTimeFrame = kline;
      await downloadHistoryData(req.body);
    }
  } else {
    downloadHistoryData(req.body);
  }
});

module.exports = router;
