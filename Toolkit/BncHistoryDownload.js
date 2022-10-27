const download = require('download');
const _ = require('lodash');
const {getDatesArray} = require('../Toolkit/OnDateOperations.js');
const {BncHistoryDownloadLog} = require('./Logger.js');
const util = require('util');
const {getExchanges} = require('../Classes/Exchanges/ExchangesClass');
const {execSync} = require('child_process');

async function downloadHistoryData(inObj) {
  return new Promise(async (resolve, reject) => {
    const baseUrl = 'https://data.binance.vision/data/spot';
    const downloadPath = `${process.env.CRYPTONITE_ROOT}\\Inboxes\\BinanceData`;
    let fileName;
    let dates;
    let url;


    const datesArr = [];
    const yesterday = new Date().setDate(new Date().getDate() -1);
    let startDate;
    let endDate;
    if (typeof inObj.startDate === 'string') {
      startDate = new Date(inObj.startDate);
      endDate = inObj.endDate ? new Date(inObj.endDate) : false;
    }

    if (yesterday < endDate) {
      throw (new Error('End Date cannot be bigger than yesterdays date.'));
    }
    if (!endDate) {
      dates = [startDate.toISOString().split('T')[0]];
    } else if ((endDate.getMonth() - startDate.getMonth()) === 0) {
      dates = getDatesArray(startDate, endDate, 'days');
    } else {
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();
      const lastDay = new Date(startYear, startMonth +1, 1);
      let tempArray = getDatesArray(startDate, lastDay, 'days');
      datesArr.push(tempArray);

      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth() + 1;
      let firstDay;
      if (endMonth <= 9) {
        firstDay = new Date(`${endYear}-0${endMonth}-01`);
      } else {
        firstDay = new Date(`${endYear}-${endMonth}-01`);
      }
      tempArray = getDatesArray(firstDay, endDate, 'days');
      datesArr.push(tempArray);

      tempArray = getDatesArray(new Date(startYear, startMonth +2), new Date(endYear, endMonth -1 ), 'months');
      datesArr.push(tempArray);

      dates = _.flatten(datesArr);
    }

    const csvFileNameLength = 8;

    for (const date of dates) {
      if (date.length < csvFileNameLength) {
        inObj.timeFrame = 'monthly';
      } else {
        inObj.timeFrame = 'daily';
      }

      if (inObj.tradeType === 'klines') {
        fileName = `${inObj.symbol}-${inObj.klinesTimeFrame}-${date}.zip`;
        url = `${baseUrl}/${inObj.timeFrame}/${inObj.tradeType}/${inObj.symbol}/${inObj.klinesTimeFrame}/${fileName}`;
      } else {
        fileName = `${inObj.symbol}-${inObj.tradeType}-${date}.zip`;
        url = `${baseUrl}/${inObj.timeFrame}/${inObj.tradeType}/${inObj.symbol}/${fileName}`;
      }

      try {
        BncHistoryDownloadLog.info(`Downloading from URL: ${url} to ${downloadPath}`);
        await download(url, downloadPath);
        BncHistoryDownloadLog.info('Download completed.');
      } catch (error) {
        if (util.inspect(error.message).includes('404')) {
          BncHistoryDownloadLog.info('Symbol does not exist');
          resolve(true);
          return;
        }
        BncHistoryDownloadLog.error(`Error while downloading. ${error}`);
        continue;
      }
    }
    resolve(true);
  });
}

async function binanceHistoryData(inObj) {
  let counter = 1;
  const klinesArr = [
    '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1mo',
  ];
  const symbols = [...getExchanges()['binance'].symbolList];

  if (inObj.symbol === 'all' && inObj.klinesTimeFrame === 'all') {
    for (const symbol of symbols) {
      for (const kline of klinesArr) {
        counter++;
        BncHistoryDownloadLog.info(`Current: ${counter} / ${symbols.length * klinesArr.length}`);
        inObj.symbol = symbol;
        inObj.klinesTimeFrame = kline;
        await downloadHistoryData(inObj);
      }
    }
  } else if (inObj.symbol === 'all') {
    for (const symbol of symbols) {
      counter++;
      BncHistoryDownloadLog.info(`Current: ${counter} / ${symbols.length}`);
      inObj.symbol = symbol;
      await downloadHistoryData(inObj);
    }
  } else if (inObj.symbol === 'allUSDT') {
    const usdtSymbols = [];

    for (const symbol of symbols) {
      if (symbol.match(/.*USDT/)) {
        usdtSymbols.push(symbol);
      }
    }

    for (const symbol of usdtSymbols) {
      BncHistoryDownloadLog.info(`Current: ${counter} / ${usdtSymbols.length}`);
      counter++;
      inObj.symbol = symbol;
      await downloadHistoryData(inObj);
    }
  } else if (inObj.klinesTimeFrame === 'all') {
    for (const kline of klinesArr) {
      counter++;
      BncHistoryDownloadLog.info(`Current: ${counter} / ${klinesArr.length}`);
      inObj.klinesTimeFrame = kline;
      await downloadHistoryData(inObj);
    }
  } else {
    await downloadHistoryData(inObj);
  }

  BncHistoryDownloadLog.info('Processing downloaded files...');
  execSync('Cryptonite.CryptoniteJS.BinanceHistoryData', {'shell': 'pwsh.exe', 'stdio': 'ignore'});
  BncHistoryDownloadLog.info('Data has been successfully imported');
}

module.exports = {
  binanceHistoryData,
};
