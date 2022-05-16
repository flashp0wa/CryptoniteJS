const csv = require('@fast-csv/parse');
const {once} = require('events');
const {ApplicationLog} = require('../Toolkit/Logger.js');

/**
 *
 * @param {string} csvpath // Absolute path to the csv file
 * @param {function} queryProcessorFunction
 * @param {object} fileInfo
 */
async function parseCsv(csvpath, queryProcessorFunction, fileInfo) {
  let results = [];
  const parseFile = csv.parseFile(csvpath);

  parseFile.on('error', (error) =>
    ApplicationLog.error(`An error occured while parsing csv. ${error}`),
  ),
  parseFile.on('data', async (row) => {
    results.push(row);
    if (results.length >= 1000) {
      parseFile.pause();
      await queryProcessorFunction(results, fileInfo);
      results = [];
      parseFile.resume();
    }
  }),
  parseFile.on('end', async (rowCount) => {
    await queryProcessorFunction(results, fileInfo);
    ApplicationLog.info(`CSV parsing done. Processed ${rowCount} rows.`);
  });
  await once(parseFile, 'end');
}

module.exports = {
  parseCsv,
};


