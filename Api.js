const {returnEmitter} = require('./Loaders/EventEmitter.js');
const express = require('express');
const dataBank = require('./Loaders/LoadDataBank.js');
const {ApiLog} = require('./Toolkit/Logger.js');
const {startDataScan} = require('./Toolkit/DataScan.js');
const queryProcessor = require('./DatabaseConnection/QueryProcessor.js');
const {downloadHistoryData} = require('./Toolkit/BncHistoryDownload.js');
const _ = require('lodash');

/**
 * Initializes cryptonite API
 */
function startApi() {
  const app = express();
  const port = process.env.CRYPTONITE_API_PORT;

  const globalEvent = returnEmitter();

  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', `${process.env.FRONTEND_URL}`);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  app.use(express.json());

  app.post('/trade/createOrder', (req, res) => {
    ApiLog.info('Creating order');
    globalEvent.emit('CreateOrder', req.body);
    res.send('Request sent');
  });

  app.get('/exchange/:exchange/getSymbols', (req, res) => {
    (async () => {
      try {
        const exchange = dataBank.getCcxtExchange(req.params.exchange);
        const symbols = [];
        const markets = await exchange.loadMarkets();
        for (const market in markets) {
          if (Object.hasOwnProperty.call(markets, market)) {
            symbols.push(markets[market].info.symbol);
          }
        }
        res.send(symbols);
      } catch (error) {
        ApiLog.error(`Could not retrieve symbols. ${error}`);
      }
    })();
  });

  app.get('/exchange/:exchange/getAccountInfo', (req, res) => {
    (async () => {
      try {
        const exchange = dataBank.getCcxtExchange(req.params.exchange);
        const balance = await exchange.fetchBalance();
        const openOrders = await exchange.fetchOpenOrders();
        const response = {};
        response.free = balance.free;
        response.used = balance.used;
        response.openOrders = openOrders;
        res.send(response);
      } catch (error) {
        ApiLog.error(`Could not retrieve account info. ${error}`);
      }
    })();
  });
  
  app.get('/exchange/:exchange/cancelOrders/:symbol', (req, res) => {
    (async () => {
      try {
        const exchange = dataBank.getCcxtExchange(req.params.exchange);
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
          ApiLog.info('All orders have been canceled.')
        } else {
          exchange.cancelAllOrders(req.params.symbol);
          ApiLog.info(`Orders for ${req.params.symbol} has been canceled.`)
        }
      } catch (error) {
        ApiLog.error(`Cannot cancel orders. ${error}`);
      }
    })();
  });

  app.post('/exchange/binance/historyDataDownload', (req, res) => {
    downloadHistoryData(req.body);
    res.send('Download started');
  });

  app.get('/dataScan/binance/coinDataImport', (req, res) => {
    startDataScan();
    res.send('Scan initiated...');
  });

  app.get('/dataScan/newCoinCheck', (req, res) => {
    queryProcessor.getAvailableCurrencies(queryProcessor.getNewCurrencies);
    res.send('Scan initiated...');
  });

  app.listen(port, () => {
    ApiLog.info(`API started on port: ${process.env.CRYPTONITE_API_PORT}`);
  });
}

module.exports = {
  startApi,
};
