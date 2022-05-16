const {parseCsv} = require('../Toolkit/CsvReader.js');
const {csvJsonStream2Object} = require('../Streams/ProcessStream.js');
const fs = require('fs');
const {ApplicationLog} = require('../Toolkit/Logger.js');

/**
 *
 * @param {object} readInfo // Information object (Filenames, Paths)
 * @return {boolean}
 */
async function collectBinanceDataFromCsv(readInfo) {
  for (const csv of readInfo.NewFiles) {
    ApplicationLog.info(`Processing ${csv}`);
    const findDot = csv.indexOf('.');
    const csvName = csv.slice(0, findDot);
    const fileNameArray = csvName.split('-');
    const fileInfo = {};

    ApplicationLog.silly(`The current trade type is ${fileNameArray[1]}`);
    fileInfo.Symbol = fileNameArray[0];
    if (fileNameArray[1] !== 'aggTrades' && fileNameArray[1] !== 'trades') {
      fileInfo.DataType = `kline_${fileNameArray[1]}`;
      fileInfo.KlineTimeFrame = fileNameArray[1];
    } else {
      fileInfo.DataType = fileNameArray[1];
    }

    if (fileNameArray.length < 5) {
      fileInfo.TimeFrame = 'monthly';
    } else {
      fileInfo.TimeFrame = 'daily';
    }

    const fullCsvpath = readInfo.Path + csv;
    try {
      await parseCsv(fullCsvpath, csvJsonStream2Object, fileInfo);
      ApplicationLog.info(`${csvName} has been processed.`);
    } catch (error) {
      ApplicationLog.error(`CSV parsing failed. ${error.stack}`);
    }
    fs.unlink(fullCsvpath, (error) => {
      if (error) ApplicationLog.error(`Couldn't delete ${csvName}. ${error}`);
      ApplicationLog.info(`${csvName} has been deleted.`);
    });
  }
  ApplicationLog.info('All CSV(s) have been processed.');
  return true;
}

module.exports = {
  collectBinanceDataFromCsv,
};
