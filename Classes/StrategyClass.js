const {getTechnicalIndicators} = require('./TechnicalIndicatorClass');
const {StrategyHandlerLog} = require('../Toolkit/Logger');
const {returnEmitter} = require('../Loaders/EventEmitter');
const {sproc_InsertIntoOrderFailed} = require('../DatabaseConnection/SQLConnector');


class StrategyClass {
  constructor(excObj, excName) {
    this.excObj = excObj; // CCXT Exchange object
    this.excName = excName; // Exchange name
    this.globalEvent = returnEmitter(); // Global event object
    this.technicalIndicators = getTechnicalIndicators();
    this.srCandleTree = {};
  }
  /**
   * IMPORTANT: Because of the balance fetching two calculations may overlap causing timeFrameObj not resetting
   * which may cause false order placement. However this may be an issue only with klines with timeframe < 1m
   * @param {object} klineObj
   * @return {void}
   */
  async run_srCandleTree(klineObj) {
    if (klineObj.closed === false) return;

    let timeFrameObj;

    if (this.srCandleTree[klineObj.symbol]) {
      timeFrameObj = this.srCandleTree[klineObj.symbol][klineObj.timeFrame];
    }

    StrategyHandlerLog.log({
      level: 'info',
      message: 'Support/Resistance strategy initiated...',
      senderFunction: 'run_srCandleTree',
      file: 'StrategyClass.js',
    });

    /**
   * Returns an object with the trade side (buy/sell), strategy id and candle stack. If no match found returns an empty object
   * @param {string} activator Support or Resistance
   * @param {int} candle1
   * @param {int} candle2
   * @param {int} candle3
   * @param {int} candle4
   * @param {int} candle5
   * @return {object}
   */
    function candleTree(activator, candle1, candle2, candle3, candle4, candle5) {
      StrategyHandlerLog.log({
        level: 'info',
        message: 'Initiating candle tree decision...',
        senderFunction: 'candleTree',
        file: 'StrategyClass.js',
      });

      switch (activator) {
        case 'resistance':
          switch (candle1) {
            case 3:
              switch (true) {
                case (candle2 === 6 && candle3 === 6 || 9 || 0 || 8 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 1366',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {
                    side: 1,
                    id: 1366,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [6, 9, 0, 8],
                    },
                  };
                default:
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'No match',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {};
              }
            case 4:
              switch (true) {
                case (candle2 === 6 && candle3 === 6 || 9 || 0 || 8 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 1466',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {
                    side: 1,
                    id: 1466,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [6, 9, 0, 8],
                    },
                  };

                case (candle2 === 6 && candle3 === 1 || 2 || 5 && candle4 === 5 || 1 || 7 && candle5 === 5 || 1 || 7 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 2 | ID: 246155',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {
                    side: 2,
                    id: 246155,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [1, 2, 5],
                      'candle4': [5, 1, 7],
                      'candle5': [5, 1, 7],
                    },
                  };

                case (candle2 === 9 && candle3 === 6 || 8 || 0 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 1496',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {
                    side: 1,
                    id: 1496,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [6, 8, 0],
                    },
                  };

                case (candle2 === 0 && candle3 === 6 || 8 || 0 || 9 || 7 || 3 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 1406',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {
                    side: 1,
                    id: 1406,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [6, 8, 0, 9, 7, 3],
                    },
                  };
                default:
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'No match',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {};
              }
            case 2:
              switch (true) {
                case (candle2 === 6 && candle3 === 6 || 9 || 0 || 8):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 1266',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {
                    side: 1,
                    id: 1266,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [6, 9, 0, 8],
                    },
                  };

                case (candle2 === 0 && candle3 === 6 || 8 || 0 || 9 || 7 || 3):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 1206',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {
                    side: 1,
                    id: 1206,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [6, 8, 0, 9, 7, 3],
                    },
                  };
                default:
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'No match',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {};
              }
            case 5:
              switch (true) {
                case (candle2 === 6 && candle3 === 1 || 2 || 5 && candle4 === 5 || 1 || 7 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 2 | ID: 25615',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {
                    side: 2,
                    id: 25615,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [1, 2, 5],
                      'candle4': [5, 1, 7],
                    },
                  };

                case (candle2 === 0 && candle3 === 6 || 8 || 0 || 9 || 7 || 3 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 1506',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {
                    side: 1,
                    id: 1506,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [6, 8, 0, 9, 7, 3],
                    },
                  };
                case (candle2 === 0 && candle3 === 5 || 2 || 1 || 4 && candle4 === 1 || 5 || 7 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 2 | ID: 25051',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {
                    side: 2,
                    id: 25051,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [5, 2, 1, 4],
                      'candle4': [1, 5, 7],
                    },
                  };
                default:
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'No match',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {};
              }
            case 1:
              switch (true) {
                case (candle2 === 6 && candle3 === 6 || 9 || 0 || 8 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 1166',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {
                    side: 1,
                    id: 1166,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [6, 9, 0, 8],
                    },
                  };

                case (candle2 === 6 && candle3 === 3 || 4 || 0 && candle4 === 6 || 8 || 9 || 0 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 11636',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {
                    side: 1,
                    id: 11636,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [3, 4, 0],
                      'candle4': [6, 8, 9, 0],
                    },
                  };

                case (candle2 === 6 && candle3 === 1 || 2 || 5 && candle4 === 5 || 1 || 7 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 2 | ID: 21615',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {
                    side: 2,
                    id: 21615,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [1, 2, 5],
                      'candle4': [5, 1, 7],
                    },
                  };

                case (candle2 === 9 && candle3 === 6 || 8 || 0 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 1196',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {
                    side: 1,
                    id: 1196,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [6, 8, 0],
                    },
                  };

                case (candle2 === 0 && candle3 === 6 || 8 || 0 || 9 || 7 || 3 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 1106',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {
                    side: 1,
                    id: 1106,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [6, 8, 0, 9, 7, 3],
                    },
                  };

                case (candle2 === 0 && candle3 === 5 || 2 || 1 && candle4 === 6 || 8 || 0 || 9 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 11056',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {
                    side: 1,
                    id: 11056,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [1, 2, 5],
                      'candle4': [6, 8, 0, 9],
                    },
                  };

                default:
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'No match found',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {};
              }
            default:
              StrategyHandlerLog.log({
                level: 'info',
                message: 'No match found',
                senderFunction: 'candleTree',
                file: 'StrategyClass.js',
              });
              return {};
          }
        case 'support':
          switch (candle1) {
            case 9:
              switch (true) {
                case (candle2 === 1 && candle3 === 1 || 4 || 5 || 2 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 1911',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {
                    side: 1,
                    id: 1911,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [1, 4, 2, 5],
                    },
                  };

                case (candle2 === 4 && candle3 === 1 || 5 || 2 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 1941',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });
                  return {
                    side: 1,
                    id: 1941,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [1, 2, 5],
                    },
                  };

                case (candle2 === 5 && candle3 === 1 || 4 || 5 || 2 || 3 || 7 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 1951',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });

                  return {
                    side: 1,
                    id: 1951,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [1, 4, 2, 5, 3, 7],
                    },
                  };
                default:
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'No match found',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });

                  return {};
              }
            case 7:
              switch (true) {
                case (candle2 === 1 && candle3 === 1 || 4 || 5 || 2 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 1711',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });

                  return {
                    side: 1,
                    id: 1711,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [1, 2, 5, 4],
                    },
                  };
                default:
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'No match found',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });

                  return {};
              }
            case 8:
              switch (true) {
                case (candle2 === 1 && candle3 === 1 || 4 || 5 || 2 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 1811',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });

                  return {
                    side: 1,
                    id: 1811,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [1, 2, 5, 4],
                    },
                  };
                default:
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'No match found',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });

                  return {};
              }
            case 0:
              switch (true) {
                case (candle2 === 1 && candle3 === 6 || 8 || 0 && candle4 === 0 || 6 || 3 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 2 | ID: 20160',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });

                  return {
                    side: 2,
                    id: 20160,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [1, 2, 5],
                      'candle4': [5, 1, 7],
                      'candle5': [5, 1, 7],
                    },
                  };
                case (candle2 === 5 && candle3 === 6 || 8 || 0 || 9 && candle4 === 0 || 6 || 3 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 2 | ID: 20506',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });

                  return {
                    side: 2,
                    id: 20506,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [1, 2, 5],
                      'candle4': [5, 1, 7],
                      'candle5': [5, 1, 7],
                    },
                  };
                default:
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'No match found',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });

                  return {};
              }
            case 6:
              switch (true) {
                case (candle2 === 1 && candle3 === 1 || 4 || 5 || 2 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 1611',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });

                  return {
                    side: 1,
                    id: 1611,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [1, 2, 5, 4],
                    },
                  };
                case (candle2 === 1 && candle3 === 7 || 9 || 5 && candle4 === 1 || 2 || 4 || 5 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 16171',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });

                  return {
                    side: 1,
                    id: 16171,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [7, 9, 5],
                      'candle4': [1, 2, 4, 5],
                    },
                  };
                case (candle2 === 1 && candle3 === 6 || 8 || 0 && candle4 === 0 || 6 || 3 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 2 | ID: 26160',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });

                  return {
                    side: 2,
                    id: 26160,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [6, 8, 0],
                      'candle4': [0, 6, 3],
                    },
                  };

                case (candle2 === 4 && candle3 === 1 || 2 || 5 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 1641',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });

                  return {
                    side: 1,
                    id: 1641,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [1, 2, 5],
                    },
                  };
                case (candle2 === 5 && candle3 === 1 || 2 || 5 || 4 || 3 || 7 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 1651',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });

                  return {
                    side: 1,
                    id: 1651,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [1, 2, 5, 4, 3, 7],
                    },
                  };
                case (candle2 === 5 && candle3 === 0 || 8 || 6 && candle4 === 1 || 2 || 5 || 4 ):
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'Match found. Side: 1 | ID: 16501',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });

                  return {
                    side: 1,
                    id: 16501,
                    stack: {
                      'candle1': candle1,
                      'candle2': candle2,
                      'candle3': [0, 8, 6],
                      'candle4': [1, 2, 5, 4],
                    },
                  };

                default:
                  StrategyHandlerLog.log({
                    level: 'info',
                    message: 'No match found',
                    senderFunction: 'candleTree',
                    file: 'StrategyClass.js',
                  });

                  return {};
              }
            default:
              StrategyHandlerLog.log({
                level: 'info',
                message: 'No match found',
                senderFunction: 'candleTree',
                file: 'StrategyClass.js',
              });

              return {};
          }
        default:
          break;
      }
    }
    /**
     * Resets timeframe object on srCandleTree.symbol
     * @param {object} timeFrameObj
     */
    function resetTimeFrameObj(timeFrameObj) {
      StrategyHandlerLog.log({
        level: 'info',
        message: 'Reseting timeframe values',
        senderFunction: 'resetTimeFrameObj',
        file: 'StrategyClass.js',
      });
      timeFrameObj.isActive = false;
      timeFrameObj.closePrices = [];
      timeFrameObj.openPrices = [];
      timeFrameObj.lowPrices = [];
      timeFrameObj.highPrices = [];
      timeFrameObj.candleTypeIds = [];
      timeFrameObj.activator = null;
    }
    /**
     * Calculates order details then placing it.
     * @param {string} symbol
     * @param {string} excName
     * @param {string} side
     * @param {string} atr
     * @param {number} support
     * @param {number} resistance
     * @param {object} timeFrameObj
     * @param {number} capital
     * @param {object} event
     * @return {void}
     */
    function placeOrder(symbol, excName, side, atr, support, resistance, timeFrameObj, capital, event) {
      StrategyHandlerLog.log({
        level: 'info',
        message: 'Placing order...',
        senderFunction: 'placeOrder',
        file: 'StrategyClass.js',
      });

      let orderSide;
      let stop;
      let limit;
      const absLow = Math.min(...timeFrameObj.lowPrices);
      const absHigh = Math.max(...timeFrameObj.highPrices);
      const openEntryCandle = timeFrameObj.openPrices[timeFrameObj.openPrices.length - 1];
      const closeEntryCandle = timeFrameObj.closePrices[timeFrameObj.closePrices.length - 1];
      const risk = process.env.RISK;
      const leverage = process.env.BNC_LEVERAGE;
      const orderType = 'market';

      if ((timeFrameObj.activator === 'support' && side === 1) ||
      (timeFrameObj.activator === 'resistance' && side === 2)) orderSide = 'buy';
      if ((timeFrameObj.activator === 'support' && side === 2) ||
      (timeFrameObj.activator === 'resistance' && side === 1)) orderSide = 'sell';

      if (side === 1) {
        if (orderSide === 'buy') {
          stop = absLow - atr;
          limit = openEntryCandle + (1.5 * (openEntryCandle - absLow + atr));
        } else {
          stop = absHigh + atr;
          limit = openEntryCandle - (1.5 * (absHigh + atr - openEntryCandle));
        }
      } else {
        if (orderSide === 'buy') {
          stop = absLow - atr;
          limit = openEntryCandle + (3 * (openEntryCandle - absLow + atr));
        } else {
          stop = absHigh + atr;
          limit = openEntryCandle - (3 * (absHigh + atr - openEntryCandle));
        }
      }
      const positionSize = (capital * risk) / (Math.abs(openEntryCandle - stop));
      const margin = positionSize * openEntryCandle / leverage;
      const criteria = margin < (capital * process.env.POS_CRITERIA * leverage) / openEntryCandle;

      StrategyHandlerLog.log({
        level: 'info',
        message: `
        Capital: ${capital}
        ABS-Low: ${absLow}
        ABS-High: ${absHigh}
        Entry Candle Open Price: ${openEntryCandle}
        Entry Candle Close Price: ${closeEntryCandle}
        Risk: ${risk}
        Leverage: ${leverage}
        Position Size: ${positionSize}
        Margin: ${margin}
        Criteria: ${criteria}
        Order Type: ${orderType}
        Order Side: ${orderSide}
        Stop: ${stop}
        Limit: ${limit} 
        `,
        senderFunction: 'placeOrder',
        file: 'StrategyClass.js',
      });

      const orderObj = {
        symbol: symbol,
        side: orderSide,
        type: orderType,
        orderAmount: positionSize,
        price: closeEntryCandle,
        stopPrice: stop,
        limitPrice: limit,
        exchange: excName,
        strategy: 'Candle-Tree',
      };

      if (closeEntryCandle < resistance) {
        orderObj.reason = 'Entry candle close price is lower than resistance level.';
        sproc_InsertIntoOrderFailed(orderObj);
        StrategyHandlerLog.log({
          level: 'warn',
          message: 'Entry candle close price is lower than resistance level. No order will be placed',
          senderFunction: 'placeOrder',
          file: 'StrategyClass.js',
        });
      } else if (closeEntryCandle > support) {
        orderObj.reason = 'Entry candle close price is higher than support level.';
        sproc_InsertIntoOrderFailed(orderObj);
        StrategyHandlerLog.log({
          level: 'warn',
          message: 'Entry candle close price is higher than support level. No order will be placed',
          senderFunction: 'placeOrder',
          file: 'StrategyClass.js',
        });
      } else if (!criteria) {
        orderObj.reason = 'Margin value does not meet criteria.';
        sproc_InsertIntoOrderFailed(orderObj);
        StrategyHandlerLog.log({
          level: 'warn',
          message: 'Margin value does not meet criteria. No order will be placed',
          senderFunction: 'placeOrder',
          file: 'StrategyClass.js',
        });
      } else {
        event.emit('CreateOrder', orderObj);
        StrategyHandlerLog.log({
          level: 'warn',
          message: 'Order placement initiated',
          senderFunction: 'placeOrder',
          file: 'StrategyClass.js',
        });
      }
    }

    const support = this.technicalIndicators.supportResistance[klineObj.symbol][klineObj.timeFrame].support;
    const resistance = this.technicalIndicators.supportResistance[klineObj.symbol][klineObj.timeFrame].resistance;
    const supportWTolerance = support + (support * process.env.SR_TOLERANCE);
    const resistanceWTolerance = resistance - (resistance * process.env.SR_TOLERANCE);

    let activator;

    // Activate candle tree decision
    if (klineObj.lowPrice <= supportWTolerance ||
      klineObj.highPrice >= resistanceWTolerance ||
      timeFrameObj.isActive === true) {
      if (klineObj.lowPrice <= supportWTolerance) {
        activator = 'support';
        StrategyHandlerLog.log({
          level: 'info',
          message: 'Candle tree decision activated by support level',
          senderFunction: 'run_srCandleTree',
          file: 'StrategyClass.js',
        });
      }
      if (klineObj.highPrice >= resistanceWTolerance) {
        activator = 'resistance';
        StrategyHandlerLog.log({
          level: 'info',
          message: 'Candle tree decision activated by resistance level',
          senderFunction: 'run_srCandleTree',
          file: 'StrategyClass.js',
        });
      }

      switch (true) {
        // If symbol does not exist
        case !this.srCandleTree[klineObj.symbol]:
          this.srCandleTree[klineObj.symbol] = {
            [klineObj.timeFrame]: {
              'closePrices': [klineObj.closePrice],
              'openPrices': [klineObj.openPrice],
              'lowPrices': [klineObj.lowPrice],
              'highPrices': [klineObj.highPrice],
              'candleTypeIds': [klineObj.candleTypeId],
              'isActive': true,
              'activator': activator,
            },
          };
          StrategyHandlerLog.log({
            level: 'info',
            message: `#1 OHLC values arrived, two more to initiate candle tree decision. Symbol: ${klineObj.symbol} | Timeframe: ${klineObj.timeFrame}`,
            senderFunction: 'run_srCandleTree',
            file: 'StrategyClass.js',
          });
          return;

        // If time frame does not exit
        case !timeFrameObj:
          this.srCandleTree[klineObj.symbol][klineObj.timeFrame] = {
            'closePrices': [klineObj.closePrice],
            'openPrices': [klineObj.openPrice],
            'lowPrices': [klineObj.lowPrice],
            'highPrices': [klineObj.highPrice],
            'candleTypeIds': [klineObj.candleTypeId],
            'isActive': true,
            'activator': activator,
          };
          StrategyHandlerLog.log({
            level: 'info',
            message: `#1 OHLC values arrived, two more to initiate candle tree decision. Symbol: ${klineObj.symbol} | Timeframe: ${klineObj.timeFrame}`,
            senderFunction: 'run_srCandleTree',
            file: 'StrategyClass.js',
          });
          return;

        case timeFrameObj && !timeFrameObj.isActive && !timeFrameObj.activator:
          timeFrameObj.isActive === true;
          timeFrameObj.activator = activator;

        default:
          timeFrameObj.closePrices.push(klineObj.closePrice);
          timeFrameObj.openPrices.push(klineObj.openPrice);
          timeFrameObj.lowPrices.push(klineObj.lowPrice);
          timeFrameObj.highPrices.push(klineObj.highPrice);
          timeFrameObj.candleTypeIds.push(klineObj.candleTypeId);
          // There must be a minimum of three candles to run candleTree
          if (timeFrameObj.candleTypeIds.length <= 2) {
            StrategyHandlerLog.log({
              level: 'info',
              message: `#${timeFrameObj.candleTypeIds.length} OHLC values arrived, ${3 - timeFrameObj.candleTypeIds.length} more to initiate candle tree decision. Symbol: ${klineObj.symbol} | Timeframe: ${klineObj.timeFrame}`,
              senderFunction: 'run_srCandleTree',
              file: 'StrategyClass.js',
            });
            return;
          }
          break;
      }

      StrategyHandlerLog.log({
        level: 'info',
        message: `
        Symbol: ${klineObj.symbol}
        TimeFrame: ${klineObj.timeFrame}
        LowPrice: ${klineObj.lowPrice}
        HighPrice: ${klineObj.highPrice}
        Support: ${support}
        Resistance: ${resistance}
        Support With Tolerance: ${supportWTolerance}
        Resistance With Tolerance: ${resistanceWTolerance}
        Activator: ${activator}
        `,
        senderFunction: 'run_srCandleTree',
        file: 'StrategyClass.js',
      });

      const candleTreeResult = candleTree(timeFrameObj.activator, ...timeFrameObj.candleTypeIds);
      if (!candleTreeResult.side && timeFrameObj.closePrices.length === 5) {
        StrategyHandlerLog.log({
          level: 'warn',
          message: 'Candle tree decision did not produce result even with the maximum of 5 candles defined',
          senderFunction: 'run_srCandleTree',
          file: 'StrategyClass.js',
          discord: 'application-warnings',
        });

        resetTimeFrameObj(timeFrameObj);
        return;
      } else if (!candleTreeResult.side) {
        StrategyHandlerLog.log({
          level: 'warn',
          message: `Candle tree decision did not produce result. Number of candles defined: ${timeFrameObj.closePrices.length}`,
          senderFunction: 'run_srCandleTree',
          file: 'StrategyClass.js',
          discord: 'application-warnings',
        });

        return;
      };
      const atr = this.technicalIndicators.averageTrueRange[klineObj.symbol][klineObj.timeFrame].currentAtr;
      let capital;
      let fetchBalanceRetry = 0;

      while (true) {
        try {
          StrategyHandlerLog.log({
            level: 'info',
            message: 'Fetching account balance to determine capital',
            senderFunction: 'run_srCandleTree',
            file: 'StrategyClass.js',
          });

          capital = (await this.excObj.fetchBalance()).free.USDT;
          break;
        } catch (error) {
          if (fetchBalanceRetry === 3) {
            StrategyHandlerLog.log({
              level: 'error',
              message: `Could not fetch account balance. Order cannot be placed without capital. ${error}`,
              senderFunction: 'run_srCandleTree',
              file: 'StrategyClass.js',
              discord: 'application-errors',
            });

            resetTimeFrameObj(timeFrameObj);
            return;
          }
          StrategyHandlerLog.log({
            level: 'error',
            message: `Could not fetch account balance. Order cannot be placed without capital. Rertrying fetch in 30 seconds... ${error}`,
            senderFunction: 'run_srCandleTree',
            file: 'StrategyClass.js',
          });

          await new Promise((resolve) => setTimeout(() => {
            resolve();
          }, 30000));

          fetchBalanceRetry++;
        }
      }

      if (capital < process.env.CAPITAL_LOSS_THRESHOLD) {
        StrategyHandlerLog.log({
          level: 'error',
          message: `WARNING !!! CAPITAL BELOW THRESHOLD Capital: ${capital}`,
          senderFunction: 'run_srCandleTree',
          file: 'StrategyClass.js',
          discord: 'gumiszoba',
        });
      }

      placeOrder(
          klineObj.symbol,
          this.excName,
          candleTreeResult.side,
          atr,
          support,
          resistance,
          timeFrameObj,
          capital,
          this.globalEvent,
      );
      // Clear price array and deactivate candle tree check until price hits either support or resistance again
      resetTimeFrameObj(timeFrameObj);
    }
  }
}

module.exports = {
  StrategyClass,
};
