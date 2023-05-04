const {ApplicationLog} = require('../Toolkit/Logger');
const {getDatabase} = require('./Database');

class TechnicalIndicatorClass {
  constructor() {
    this.isLoaded = false;
    this.averageTrueRange;
    this.supportResistance;
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
  async atr(klineObj) {
    if (!klineObj) {
      try {
        const atrObj = {};
        const response = await this.db.singleRead('select * from itvf_GetLastAtrValues()');
        const dataPeriod = await this.db.singleRead('select * from itvf_GetTechnicalAnalysisPeriodNumber(\'Average True Range\')');
        atrObj.dataPeriod = dataPeriod[0].periodNumber;

        for (const atr of response) {
          if (!atrObj[atr.symbol]) {
            atrObj[atr.symbol] = {[atr.timeFrame]: {
              prevAtr: atr.atr,
              prevClosePrice: atr.closePrice,
              currentAtr: 0,
            }};
          }
          const symbol = atrObj[atr.symbol];
          symbol[atr.timeFrame] = {
            prevAtr: atr.atr,
            prevClosePrice: atr.closePrice,
            currentAtr: 0,
          };
        }

        this.averageTrueRange = atrObj;
      } catch (error) {
        ApplicationLog.log({
          level: 'error',
          message: `Could not load values of Average True Range. ${error}`,
          senderFunction: 'atr',
          file: 'TechnicalIndicatorClass.js',
          discord: 'application-errors',
        });
      }
    } else {
      const prevClosePrice = this.averageTrueRange[klineObj.symbol][klineObj.timeFrame].prevClosePrice;
      const prevAtr = this.averageTrueRange[klineObj.symbol][klineObj.timeFrame].prevAtr;
      const dataPeriod = this.averageTrueRange.dataPeriod;
      const method1 = klineObj.highPrice - klineObj.lowPrice;
      const method2 = Math.abs(klineObj.highPrice - prevClosePrice);
      const method3 = Math.abs(klineObj.lowPrice - prevClosePrice);
      const tr = Math.max(method1, method2, method3);
      const atr = ((prevAtr * (dataPeriod - 1)) + tr) / dataPeriod;
      this.averageTrueRange[klineObj.symbol][klineObj.timeFrame].currentAtr = atr;
      if (klineObj.closed) {
        this.averageTrueRange[klineObj.symbol][klineObj.timeFrame].prevClosePrice = klineObj.closePrice;
        this.averageTrueRange[klineObj.symbol][klineObj.timeFrame].prevAtr = atr;
      }
      return atr;
    }
  }

  async sr(klineObj) {
    /**
     * Checks for turnpoint in price
     * @param {object} inObj Symbol / TimeFrame object
     */
    function turnpointCheck(inObj) {
      const {closePrices} = inObj;
      const {highPrices} = inObj;
      const {lowPrices} = inObj;
      switch (true) {
        case (closePrices[0] < highPrices[2]) && (closePrices[1] < highPrices[2]) && (closePrices[3] < highPrices[2]) && (closePrices[4] < highPrices[2]):
          inObj.resistance = highPrices[2];
          break;

        case (closePrices[0] > lowPrices[2]) && (closePrices[1] > lowPrices[2]) && (closePrices[3] > lowPrices[2]) && (closePrices[4] > lowPrices[2]):
          inObj.support = lowPrices[2];
          break;

        default:
          break;
      }
    }
    if (!klineObj) {
      try {
        const srObj = {};
        const response = await this.db.singleRead('select * from itvf_GetLastSupportResistanceValues()');

        for (const sr of response) {
          if (!srObj[sr.symbol]) {
            srObj[sr.symbol] = {[sr.timeFrame]: {
              support: sr.support,
              resistance: sr.resistance,
              closePrices: [],
              lowPrices: [],
              highPrices: [],
            }};
          }
          const symbol = srObj[sr.symbol];
          symbol[sr.timeFrame] = {
            support: sr.support,
            resistance: sr.resistance,
            closePrices: [],
            lowPrices: [],
            highPrices: [],
          };
        }

        this.supportResistance = srObj;
      } catch (error) {
        ApplicationLog.log({
          level: 'error',
          message: `Could not load values of Support Resistance. ${error}`,
          senderFunction: 'sr',
          file: 'TechnicalIndicatorClass.js',
          discrod: 'application-errors',
        });
      }
    } else {
      if (klineObj.closed) {
        try {
          const timeFrameObj = this.supportResistance[klineObj.symbol][klineObj.timeFrame];
          if (timeFrameObj.closePrices.length < 5) {
            timeFrameObj.closePrices.push(klineObj.closePrice);
            timeFrameObj.highPrices.push(klineObj.highPrice);
            timeFrameObj.lowPrices.push(klineObj.lowPrice);
            if (timeFrameObj.closePrices.length === 5) {
              turnpointCheck(timeFrameObj);
            }
          } else {
            timeFrameObj.closePrices.shift();
            timeFrameObj.highPrices.shift();
            timeFrameObj.lowPrices.shift();
            timeFrameObj.closePrices.push(klineObj.closePrice);
            timeFrameObj.lowPrices.push(klineObj.lowPrice);
            timeFrameObj.highPrices.push(klineObj.highPrice);
            turnpointCheck(timeFrameObj);
          }
        } catch (error) {
          ApplicationLog.log({
            level: 'error',
            message: `Could not check turnpoints. ${error}`,
            senderFunction: 'sr',
            file: 'TechnicalIndicatorClass.js',
            discord: 'application-errors',
          });
        }
      }
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
      await this.atr();
      await this.sr();
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
