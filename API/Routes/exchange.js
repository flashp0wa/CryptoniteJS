const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {ApiLog} = require('../../Toolkit/Logger.js');
const _ = require('lodash');
const {getExchanges} = require('../../Classes/Exchanges/ExchangesClass');
const {binanceHistoryData} = require('../../Toolkit/BncHistoryDownload.js');
const {getDatabase} = require('../../Classes/Database.js');
const {getCryptoniteWebSocket} = require('../../Classes/WebSocket.js');
const db = getDatabase();


router.route('/:exchange/getSymbols').get((req, res) => {
  try {
    const symbols = getExchanges()[req.params.exchange].symbolList;
    res.send(symbols);
  } catch (error) {
    ApiLog.log({
      level: 'error',
      message: `Could not retrieve symbols. ${error}`,
      senderFunction: 'route-getSymbols',
      file: 'exchange.js',
    });
  }
});

router.route('/:exchange/getAccountBalance').get(async (req, res) => {
  try {
    const exchange = getExchanges();
    const balance = await exchange[req.params.exchange].excObj.fetchBalance();
    for (const [key, value] of Object.entries(balance.free)) {
      if (value === 0) {
        delete balance.free[key];
      }
    }
    for (const [key, value] of Object.entries(balance.used)) {
      if (value === 0) {
        delete balance.used[key];
      }
    }
    const response = {
      free: balance.free,
      used: balance.used,
    };
    res.send(response);
  } catch (error) {
    ApiLog.log({
      level: 'error',
      message: `Could not retrieve balance info. ${error}`,
      senderFunction: 'route-getAccountBalance',
      file: 'exchange.js',
    });
  }
});

router.route('/getOrders').post(async (req, res) => {
  try {
    const paramObj = {
      exchange: `\'${req.body.exchange}\'`,
      orderStatus: !req.body.orderStatus ? null : `\'${req.body.orderStatus}\'`,
      orderId: !req.body.orderId ? null : `\'${req.body.orderId}\'`,
      orderType: !req.body.orderType ? null : `\'${req.body.orderType}\'`,
      side: !req.body.side ? null : `\'${req.body.side}\'`,
      strategyId: !req.body.strategyId ? null : `\'${req.body.strategyId}\'`,
      startDate: !req.body.startDate ? null : `\'${req.body.startDate}\'`,
      endDate: !req.body.endDate ? null : `\'${req.body.endDate}\'`,
    };
    const orders = await db.singleRead(`select * from itvf_FE_ReturnOrders(${paramObj.exchange}, ${paramObj.orderStatus}, ${paramObj.orderId}, ${paramObj.orderType}, ${paramObj.side}, ${paramObj.strategyId}, ${paramObj.startDate}, ${paramObj.endDate})`);
    res.send(orders);
  } catch (error) {
    ApiLog.log({
      level: 'error',
      message: `Could not retrieve order info. ${error}`,
      senderFunction: 'route-getOrders',
      file: 'Api.js',
    });
  }
});
router.route('/getSymbolData').post(async (req, res) => {
  try {
    res.send(getExchanges()['binance'].excObj.technicalIndicator.getSymbolData(req.body.symbol, req.body.timeFrame));
  } catch (error) {
    ApiLog.log({
      level: 'error',
      message: `Could not retrieve order info. ${error}`,
      senderFunction: 'route-getOrders',
      file: 'Api.js',
    });
  }
});

router.route('/:exchange/cancelOrders/:symbol').get(async (req, res) => {
  try {
    const exchange = getExchanges()[req.params.exchange].excObj;
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
      ApiLog.log({
        level: 'info',
        message: 'All order have been canceled',
        senderFunction: 'route-cancelOrders',
        file: 'Api.js',
      });
      res.send('All orders canceled');
    } else {
      exchange.cancelAllOrders(req.params.symbol);
      ApiLog.log({
        level: 'info',
        message: `Orders for ${req.params.symbol} has been canceled`,
        senderFunction: 'route-cancelOrders',
        file: 'Api.js',
      });
      res.send('Order canceled');
    }
  } catch (error) {
    ApiLog.log({
      level: 'error',
      message: `Cannot cancel orders. ${error}`,
      senderFunction: 'route-cancelOrders',
      file: 'Api.js',
    });
    res.send('Order cancel failed');
  }
});

router.route('/binance/historyDataDownload').post(async (req, res) => {
  await binanceHistoryData(req.body);
  res.send('Download done');
});

router.route('/:exchange/isWssOn').get(async (req, res) => {
  const state = getCryptoniteWebSocket().isWsServerOn;
  res.send(state);
});
router.route('/:exchange/startWss').get(async (req, res) => {
  getCryptoniteWebSocket().connectToServer();
  res.send(true);
});

router.route('/binance/coinTAData').post(async (req, res) => {
  try {
    const result = await db.sproc_GatherSymbolTAData(req.body);
    res.send(result);
  } catch (error) {
    ApiLog.log({
      level: 'info',
      message: `Cannot retrieve coin data. ${error}`,
      senderFunction: 'route-coinData',
      file: 'Api.js',
    });
  }
});

module.exports = router;
