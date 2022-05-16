const {returnEmitter} = require('../Loaders/EventEmitter.js');
const {ApplicationLog} = require('./Logger.js');
const fs = require('fs');

const globalEvent = returnEmitter();

/**
 *
 * @param {Map} allPathToScan
 */
function startDataScan(allPathToScan) {
  allPathToScan = new Map([
    ['./Inboxes/BinanceData/', 'collectBinanceDataFromCsv'],
  ]);
  allPathToScan.forEach((operation, path) => {
    const readInfo = {};
    ApplicationLog.info(`Scanning for CSV...`);
    ApplicationLog.info(`Scanning path ${path}`);
    const newFiles = fs.readdirSync(path);
    if (newFiles === 0) {
      ApplicationLog.info('No files to process');
    } else {
      readInfo.NewFiles = newFiles;
      readInfo.Path = path;
      ApplicationLog.info(`Found ${newFiles.length} file(s) to process...`);
      switch (operation) {
        case 'collectBinanceDataFromCsv':
          globalEvent.emit('NewBinanceCsv', readInfo);
          break;
        default:
          console.log('Processing function does not exist.');
          break;
      }
    }
  });
}

module.exports = {
  startDataScan,
};
