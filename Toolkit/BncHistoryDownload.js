const download = require('download');
const _ = require('lodash');
const {getDatesArray} = require('../Toolkit/OnDateOperations.js');
const {BncHistoryDownloadLog, ApplicationLog} = require('./Logger.js');
const fs = require('fs');
const util = require('util');
const {runPsCommand} = require('./PowerShell.js');
const {sproc_ImportBinanceCsv} = require('../DatabaseConnection/SQLConnector.js');

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
    let fileProcessDone;
    let firstRun = true;
    let index = 0;

    for (const date of dates) {
      if (date.length < 8) {
        inObj.timeFrame = 'monthly';
      } else {
        inObj.timeFrame = 'daily';
      }

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
                if (inObj.klinesTimeFrame) {
                  BncHistoryDownloadLog.info('Importing CSV to database...');
                  const csvFile = `${file.split('.')[0]}.csv`;
                  const path = `${downloadPath}\\${csvFile}`;
                  try {
                    await sproc_ImportBinanceCsv(inObj.symbol, inObj.klinesTimeFrame, path);
                    fs.unlinkSync(`${downloadPath}\\${csvFile}`);
                    BncHistoryDownloadLog.info(`Deleting ${csvFile}...`);
                  } catch (error) {
                    BncHistoryDownloadLog.error(`Error during CSV import...${error.stack}`);
                  }
                }
              } catch (error) {
                BncHistoryDownloadLog.error(`Could not unzip ${file}. ${error.stack}`);
              }
            }
          }

          return new Promise((resolve, reject) => {
            resolve(true);
          });
        }
        if (dates.length === 1) {
          await processDownloadedData();
        } else if (firstRun) {
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
    ApplicationLog.info('Download finished....');
    resolve(true);
  });
}

module.exports = {
  downloadHistoryData,
};
