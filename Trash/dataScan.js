const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {startDataScan} = require('../../Toolkit/DataScan.js');
const queryProcessor = require('../../DatabaseConnection/QueryProcessor.js');


router.route('/binance/coinDataImport').get((req, res) => {
  console.log('start scan');
  startDataScan();
  res.send('Scan initiated...');
});

router.route('/newCoinCheck').get((req, res) => {
  queryProcessor.getAvailableCurrencies(queryProcessor.getNewCurrencies);
  res.send('Scan initiated...');
});


module.exports = router;
