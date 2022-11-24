const download = require('download');
const _ = require('lodash');
const {getDatesArray} = require('../Toolkit/OnDateOperations.js');
const {BncHistoryDownloadLog} = require('./Logger.js');
const util = require('util');
const {getExchanges} = require('../Classes/Exchanges/ExchangesClass');
const {execSync} = require('child_process');
const fs = require('fs');

async function downloadHistoryData(inObj) {
  return new Promise(async (resolve, reject) => {
    const baseUrl = 'https://data.binance.vision/data/spot';
    const downloadPath = `${process.env.CRYPTONITE_ROOT}\\Inboxes\\BinanceData`;
    const alreadyDownloaded = [];
    let oneSuccessfulDownload = false;
    let alreadyDownloadedFile = false;
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
    } else {
      if (inObj.timeFrame === 'daily') {
        tempArray = getDatesArray(startDate, endDate, 'days');
        datesArr.push(tempArray);
      } else {
        tempArray = getDatesArray(startDate, endDate, 'months');
        datesArr.push(tempArray);
      }
      dates = _.flatten(datesArr);
    }

    fs.readdirSync(downloadPath).forEach((file) => {
      alreadyDownloaded.push(file);
    });


    for (const date of dates) {
      if (inObj.tradeType === 'klines') {
        fileName = `${inObj.symbol}-${inObj.klinesTimeFrame}-${date}.zip`;
        url = `${baseUrl}/${inObj.timeFrame}/${inObj.tradeType}/${inObj.symbol}/${inObj.klinesTimeFrame}/${fileName}`;
      } else {
        fileName = `${inObj.symbol}-${inObj.tradeType}-${date}.zip`;
        url = `${baseUrl}/${inObj.timeFrame}/${inObj.tradeType}/${inObj.symbol}/${fileName}`;
      }

      if (alreadyDownloaded.length > 0) {
        for (const file of alreadyDownloaded) {
          if (file === fileName) {
            alreadyDownloadedFile = true;
            break;
          }
        }

        if (alreadyDownloadedFile) {
          BncHistoryDownloadLog.info(`${fileName} already downloaded`);
          alreadyDownloadedFile = false;
          continue;
        }
      }


      try {
        BncHistoryDownloadLog.silly(`Downloading from URL: ${url} to ${downloadPath}`);
        BncHistoryDownloadLog.info(`Downloading: ${fileName}`);
        await download(url, downloadPath);
        oneSuccessfulDownload = true;
        BncHistoryDownloadLog.info('Download completed.');
      } catch (error) {
        if (util.inspect(error.message).includes('404')) {
          BncHistoryDownloadLog.info('Date does not exist');
          // BncHistoryDownloadLog.info('Symbol does not exist');
          // resolve(true);
          // return;
          if (oneSuccessfulDownload) {
            BncHistoryDownloadLog.info('Symbol discontinued...');
            resolve(true);
            return;
          }
          continue;
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
