const {ApplicationLog} = require('../Toolkit/Logger');
const {getDatabase} = require('./Database');

class TechnicalIndicatorClass {
  constructor() {
    this.isLoaded = false;
    this.averageTrueRange;
    this.supportResistance;
    this.symbolData = new Map();
    this.db = getDatabase();
  }
  /**
   * Returns ATR values as an object
   * { ETHUSDT: { '1m' : { prevAtr: 111, prevClosePrice: 123, currentAtr: 0 } } }
   * where the first value of the array is ATR and the second is last price.
   * If the incoming Kline is closed the value will be written into the database
   * @param {object} klineObj If no object defined average true range property will be initialized
   * @return {object} Average True Range value
  */

  getSymbolData(symbolId, timeFrameId) {
    // return this.symbolData.get(symbolId).get(timeFrameId);
  }

  processSymbolData(data) {
    if (this.symbolData.has(data.symbolId)) {
      const timeFrame = this.symbolData.get(data.symbolId);
      timeFrame.set(data.timeFrameId, new Map(Object.entries(data)));
      this.symbolData.set(data.symbolId, timeFrame);
    } else {
      const timeFrame = new Map();
      timeFrame.set(data.timeFrameId, new Map(Object.entries(data)));
      this.symbolData.set(data.symbolId, timeFrame);
    }
  }

  async handleKline(klineObj) {
    try {
      const res = await this.db.sproc_InsertIntoKlines(klineObj);
      this.processSymbolData(res);
    } catch (error) {
      ApplicationLog.log({
        level: 'error',
        message: 'Error in processing kline data',
        senderFunction: 'handleKline',
        file: 'TechnicalIndicatorClass.js',
      });
    }
  }

  /**
   * Loads values for technical indicator properties from the database
   */
  async loadValues() {
    try {
      ApplicationLog.log({
        level: 'info',
        message: 'Loading technical indicator values',
        senderFunction: 'loadValues',
        file: 'TechnicalIndicatorClass.js',
      });

      const res = await this.db.singleRead('select * from itvf_GetLastSymbolData()');
      this.processSymbolData(res);

      this.isLoaded = true;
    } catch (error) {
      ApplicationLog.log({
        level: 'error',
        message: `Failed to load technical indicator values. ${error}`,
        senderFunction: 'loadValues',
        file: 'TechnicalIndicatorClass.js',
        discord: 'application-errors',
      });
    }
  }
}

let technicalIndicators = new TechnicalIndicatorClass();

function getTechnicalIndicators() {
  if (!technicalIndicators) {
    return technicalIndicators = new TechnicalIndicatorClass();
  } else {
    return technicalIndicators;
  }
}

module.exports = {
  TechnicalIndicatorClass,
  getTechnicalIndicators,
};
