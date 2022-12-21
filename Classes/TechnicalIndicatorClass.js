const {
  singleRead,
  sproc_InsertIntoAverageTrueRange,
  sproc_InsertIntoSupportResistance,
} = require('../DatabaseConnection/SQLConnector');
const {ApplicationLog} = require('../Toolkit/Logger');
const {priceRounder} = require('../Toolkit/PriceRounder');

class TechnicalIndicatorClass {
  constructor() {
    this.averageTrueRange;
    this.supportResistance;
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
        const response = await singleRead('select * from itvf_GetLastAtrValues()');
        const dataPeriod = await singleRead('select * from itvf_GetTechnicalAnalysisPeriodNumber(\'Average True Range\')');
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
        ApplicationLog.error(`Could not load values of Average True Range ${error}`);
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
      if (klineObj.closed) {
        this.averageTrueRange[klineObj.symbol][klineObj.timeFrame].prevClosePrice = klineObj.closePrice;
        this.averageTrueRange[klineObj.symbol][klineObj.timeFrame].prevAtr = atr;
        this.averageTrueRange[klineObj.symbol][klineObj.timeFrame].currentAtr = atr;
        sproc_InsertIntoAverageTrueRange({
          eventTime: klineObj.closeTime,
          symbol: klineObj.symbol,
          timeFrame: klineObj.timeFrame,
          atr: atr,
        });
      }
      this.averageTrueRange[klineObj.symbol][klineObj.timeFrame].currentAtr = atr;
      return atr;
    }
  }

  async sr(klineObj) {
    /**
     * Checks for turnpoint in price
     * @param {object} inObj Symbol / TimeFrame object
     * @param {object} klineObj Kline object
     */
    function turnpointCheck(inObj, klineObj) {
      const prices = inObj.prices;
      switch (true) {
        case (prices[0] < prices[2]) && (prices[1] < prices[2]) && (prices[3] < prices[2]) && (prices[4] < prices[2]):
          inObj.resistance = priceRounder(prices[2]);
          sproc_InsertIntoSupportResistance({
            eventTime: klineObj.closeTime,
            symbol: klineObj.symbol,
            timeFrame: klineObj.timeFrame,
            resistance: inObj.resistance,
            support: null,
          });
          break;

        case (prices[0] > prices[2]) && (prices[1] > prices[2]) && (prices[3] > prices[2]) && (prices[4] > prices[2]):
          inObj.support = priceRounder(prices[2]);
          sproc_InsertIntoSupportResistance({
            eventTime: klineObj.closeTime,
            symbol: klineObj.symbol,
            timeFrame: klineObj.timeFrame,
            resistance: null,
            support: inObj.support,
          });
          break;

        default:
          break;
      }
    }

    if (!klineObj) {
      try {
        const srObj = {};
        const response = await singleRead('select * from itvf_GetLastSupportResistanceValues()');

        for (const sr of response) {
          if (!srObj[sr.symbol]) {
            srObj[sr.symbol] = {[sr.timeFrame]: {
              support: sr.support,
              resistance: sr.resistance,
              prices: [],
            }};
          }
          const symbol = srObj[sr.symbol];
          symbol[sr.timeFrame] = {
            support: sr.support,
            resistance: sr.resistance,
            prices: [],
          };
        }

        this.supportResistance = srObj;
      } catch (error) {
        ApplicationLog.error(`Could not load values of Support Resistance ${error}`);
      }
    } else {
      if (klineObj.closed) {
        try {
          const timeFrameObj = this.supportResistance[klineObj.symbol][klineObj.timeFrame];
          if (timeFrameObj.prices.length < 5) {
            timeFrameObj.prices.push(klineObj.closePrice);
            if (timeFrameObj.prices.length === 5) {
              turnpointCheck(timeFrameObj, klineObj);
            }
          } else {
            timeFrameObj.prices.shift();
            timeFrameObj.prices.push(klineObj.closePrice);
            turnpointCheck(timeFrameObj, klineObj);
          }
        } catch (error) {
          ApplicationLog.error(`Could not check turnpoints. ${error}`);
        }
      }
    }
  }
  /**
   * Loads values for technical indicator properties from the database
   */
  async loadValues() {
    await this.atr();
    await this.sr();
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
