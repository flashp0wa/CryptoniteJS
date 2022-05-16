const download = require('download');
const {getDatesArray} = require('../Toolkit/OnDateOperations.js');
const {BncHistoryDownloadLog} = require('./Logger.js');
const fs = require('fs');
const util = require('util');
const {runPsCommand} = require('./PowerShell.js');

async function downloadHistoryData(inObj) {
  const baseUrl = 'https://data.binance.vision/data/spot';
  const downloadPath = `${process.env.CRYPTONITE_ROOT}\\Inboxes\\BinanceData`;
  let fileName;
  let dates;
  let url;

  if (inObj.startDate && inObj.endDate) {
    if (inObj.timeFrame === 'daily') {
      dates = getDatesArray(new Date(inObj.startDate), new Date(inObj.endDate), 'days');
    } else {
      dates = getDatesArray(new Date(inObj.startDate), new Date(inObj.endDate), 'months');
    }
  } else {
    if (inObj.timeFrame === 'daily') {
      dates = [inObj.startDate];
    } else {
      dates = [inObj.startDate.slice(0, 7)];
    }
  }
  let fileProcessDone;
  let firstRun = true;
  let index = 0;

  for (const date of dates) {
    index++;

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

      if (index === dates.length) {
        await fileProcessDone;
      }

      async function processDownloadedData() {
        const filesRaw = fs.readdirSync(downloadPath);
        const files = [];
        for (const file of filesRaw) {
          if (file.includes('zip')) {
            files.push(file);
          }
        }
        if (files.length > 0) {
          for (const file of files) {
            BncHistoryDownloadLog.info(`Unzipping ${file}...`);
            try {
              await runPsCommand(`Expand-Archive -Path '${downloadPath}\\${file}' -DestinationPath '${downloadPath}' -Force`);
              fs.unlinkSync(`${downloadPath}\\${file}`);
              BncHistoryDownloadLog.info(`Deleting ${file}...`);
            } catch (error) {
              BncHistoryDownloadLog.error(`Error in processing file. ${error}`);
            }
          }
        }

        return new Promise((resolve, reject) => {
          resolve(true);
        });
      }

      if (firstRun) {
        fileProcessDone = processDownloadedData();
        firstRun = false;
      } else if (!util.inspect(fileProcessDone).includes('pending')) {
        fileProcessDone = processDownloadedData();
        if (index === dates.length) {
          await fileProcessDone;
        }
      }
    } catch (error) {
      BncHistoryDownloadLog.error(`Error while downloading. ${error}`);
      continue;
    }
  }
}

module.exports = {
  downloadHistoryData,
};
