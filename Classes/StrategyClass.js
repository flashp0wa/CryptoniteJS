const {getTechnicalIndicators} = require('./TechnicalIndicatorClass');
const {StrategyHandlerLog} = require('../Toolkit/Logger');
const {returnEmitter} = require('../Loaders/EventEmitter');


class StrategyClass {
  constructor(exchangeObj, exchangeName) {
    this.exchangeObj = exchangeObj;
    this.exchangeName = exchangeName;
    this.globalEvent = returnEmitter();
    this.technicalIndicators = getTechnicalIndicators();
    this.srCandleTree = {};
  }
  /**
   * IMPORTANT: Because of the balance fetching two calculations may overlap causing timeFrameObj not resetting
   * which may cause false order placement. However this may be an issue only with klines with timeframe < 1m
   * @param {object} klineObj
   * @return {void}
   */
  async supportResistanceCandleTree(klineObj) {
    if (klineObj.closed === false) return;

    let timeFrameObj;

    if (this.srCandleTree[klineObj.symbol]) {
      timeFrameObj = this.srCandleTree[klineObj.symbol][klineObj.timeFrame];
    }


    StrategyHandlerLog.info('Support/Resistance strategy initiated...');

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
      StrategyHandlerLog.info('Initiating candle tree decision...');

      switch (activator) {
        case 'resistance':
          switch (candle1) {
            case 3:
              switch (true) {
                case (candle2 === 6 && candle3 === 6 || 9 || 0 || 8 ):
                  StrategyHandlerLog.info('Match found. Side: 1 | ID: 1366');
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
                  StrategyHandlerLog.info('No match');
                  return {};
              }
            case 4:
              switch (true) {
                case (candle2 === 6 && candle3 === 6 || 9 || 0 || 8 ):
                  StrategyHandlerLog.info('Match found. Side: 1 | ID: 1466');
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
                  StrategyHandlerLog.info('Match found. Side: 2 | ID: 246155');
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
                  StrategyHandlerLog.info('Match found. Side: 1 | ID: 1496');
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
                  StrategyHandlerLog.info('Match found. Side: 1 | ID: 1406');
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
                  StrategyHandlerLog.info('No match');
                  return {};
              }
            case 2:
              switch (true) {
                case (candle2 === 6 && candle3 === 6 || 9 || 0 || 8):
                  StrategyHandlerLog.info('Match found. Side: 1 | ID: 1266');
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
                  StrategyHandlerLog.info('Match found. Side: 1 | ID: 1206');
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
                  StrategyHandlerLog.info('No match found');
                  return {};
              }
            case 5:
              switch (true) {
                case (candle2 === 6 && candle3 === 1 || 2 || 5 && candle4 === 5 || 1 || 7 ):
                  StrategyHandlerLog.info('Match found. Side: 2 | ID: 25615');
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
                  StrategyHandlerLog.info('Match found. Side: 1 | ID: 1506');
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
                  StrategyHandlerLog.info('Match found. Side: 2 | ID: 25051');
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
                  StrategyHandlerLog.info('No match');
                  return {};
              }
            case 1:
              switch (true) {
                case (candle2 === 6 && candle3 === 6 || 9 || 0 || 8 ):
                  StrategyHandlerLog.info('Match found. Side: 1 | ID: 1166');
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
                  StrategyHandlerLog.info('Match found. Side: 1 | ID: 11636');
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
                  StrategyHandlerLog.info('Match found. Side: 2 | ID: 21615');
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
                  StrategyHandlerLog.info('Match found. Side: 1 | ID: 1196');
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
                  StrategyHandlerLog.info('Match found. Side: 1 | ID: 1106');
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
                  StrategyHandlerLog.info('Match found. Side: 1 | ID: 11056');
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
                  StrategyHandlerLog.info('No match found');
                  return {};
              }
            default:
              StrategyHandlerLog.info('No match found');
              return {};
          }
        case 'support':
          switch (candle1) {
            case 9:
              switch (true) {
                case (candle2 === 1 && candle3 === 1 || 4 || 5 || 2 ):
                  StrategyHandlerLog.info('Match found. Side: 1 | ID: 1911');
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
                  StrategyHandlerLog.info('Match found. Side: 1 | ID: 1941');
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
                  StrategyHandlerLog.info('Match found. Side: 1 | ID: 1951');
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
                  StrategyHandlerLog.info('No match found');
                  return {};
              }
            case 7:
              switch (true) {
                case (candle2 === 1 && candle3 === 1 || 4 || 5 || 2 ):
                  StrategyHandlerLog.info('Match found. Side: 1 | ID: 1711');
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
                  StrategyHandlerLog.info('No match found');
                  return {};
              }
            case 8:
              switch (true) {
                case (candle2 === 1 && candle3 === 1 || 4 || 5 || 2 ):
                  StrategyHandlerLog.info('Match found. Side: 1 | ID: 1811');
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
                  StrategyHandlerLog.info('No match found');
                  return {};
              }
            case 0:
              switch (true) {
                case (candle2 === 1 && candle3 === 6 || 8 || 0 && candle4 === 0 || 6 || 3 ):
                  StrategyHandlerLog.info('Match found. Side: 2 | ID: 20160');
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
                  StrategyHandlerLog.info('Match found. Side: 2 | ID: 20506');
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
                  StrategyHandlerLog.info('No match found');
                  return {};
              }
            case 6:
              switch (true) {
                case (candle2 === 1 && candle3 === 1 || 4 || 5 || 2 ):
                  StrategyHandlerLog('Match found. Side: 1 | ID: 1611');
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
                  StrategyHandlerLog('Match found. Side: 1 | ID: 16171');
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
                  StrategyHandlerLog('Match found. Side: 2 | ID: 26160');
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
                  StrategyHandlerLog('Match found. Side: 1 | ID: 1641');
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
                  StrategyHandlerLog('Match found. Side: 1 | ID: 1651');
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
                  StrategyHandlerLog('Match found. Side: 1 | ID: 16501');
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
                  StrategyHandlerLog.info('No match found');
                  return {};
              }
            default:
              StrategyHandlerLog.info('No match found');
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
      StrategyHandlerLog.info('Reseting timeframe values');
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
     * @param {string} exchangeName
     * @param {string} side
     * @param {string} atr
     * @param {number} support
     * @param {number} resistance
     * @param {object} timeFrameObj
     * @param {number} capital
     * @param {object} event
     * @return {void}
     */
    function placeOrder(symbol, exchangeName, side, atr, support, resistance, timeFrameObj, capital, event) {
      StrategyHandlerLog.info('Placing order...');
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

      StrategyHandlerLog.info(`
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
      `);

      if (closeEntryCandle < resistance) {
        StrategyHandlerLog.warn('Entry candle close price is lower than resistance level. No order will be placed');
      } else if (closeEntryCandle > support) {
        StrategyHandlerLog.warn('Entry candle close price is higher than support level. No order will be placed');
      } else if (!criteria) {
        StrategyHandlerLog.warn('Margin value does not meet criteria. No order will be placed');
      } else {
        event.emit('CreateOrder', {
          symbol: symbol,
          side: orderSide,
          type: orderType,
          orderAmount: positionSize,
          price: closeEntryCandle,
          stopPrice: stop,
          limitPrice: limit,
          exchange: exchangeName,
        });

        StrategyHandlerLog.info('Order has been placed.');
      }
    }


    const support = this.technicalIndicators.supportResistance[klineObj.symbol][klineObj.timeFrame].support;
    const resistance = this.technicalIndicators.supportResistance[klineObj.symbol][klineObj.timeFrame].resistance;
    const supportWTolerance = support + (support * process.env.SR_TOLERANCE);
    const resistanceWTolerance = resistance - (resistance * process.env.SR_TOLERANCE);

    let activator;

    // console.log(`Support: ${supportWTolerance}`);
    // console.log(`Resistance: ${resistanceWTolerance}`);
    // console.log(timeFrameObj);

    // Activate candle tree decision
    if (klineObj.lowPrice <= supportWTolerance ||
      klineObj.highPrice >= resistanceWTolerance ||
      timeFrameObj.isActive === true) {
      if (klineObj.lowPrice <= supportWTolerance) {
        activator = 'support';
        StrategyHandlerLog.info('Candle tree decision activated by support level');
      }
      if (klineObj.highPrice >= resistanceWTolerance) {
        activator = 'resistance';
        StrategyHandlerLog.info('Candle tree decision activated by resistance level');
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
          StrategyHandlerLog.info('#1 OHLC values arrived, two more to go to initiate candle tree decision');
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
          StrategyHandlerLog.info('#1 OHLC values arrived, two more to initiate candle tree decision');
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
            StrategyHandlerLog.info(`#${timeFrameObj.candleTypeIds.length} OHLC values arrived, ${3 - timeFrameObj.candleTypeIds.length} more to initiate candle tree decision`);
            return;
          }
          break;
      }

      StrategyHandlerLog.info(`
      Symbol: ${klineObj.symbol}
      TimeFrame: ${klineObj.timeFrame}
      LowPrice: ${klineObj.lowPrice}
      HighPrice: ${klineObj.highPrice}
      Support: ${support}
      Resistance: ${resistance}
      Support With Tolerance: ${supportWTolerance}
      Resistance With Tolerance: ${resistanceWTolerance}
      Activator: ${activator}
      `);

      const candleTreeResult = candleTree(timeFrameObj.activator, ...timeFrameObj.candleTypeIds);
      if (!candleTreeResult.side && timeFrameObj.closePrices.length === 5) {
        StrategyHandlerLog.warn('Candle tree decision did not produce result even with the maximum of 5 candles defined');
        resetTimeFrameObj(timeFrameObj);
        return;
      } else if (!candleTreeResult.side) {
        StrategyHandlerLog.warn(`Candle tree decision did not produce result. Number of candles defined: ${timeFrameObj.closePrices.length}`);
        return;
      };
      const atr = this.technicalIndicators.averageTrueRange[klineObj.symbol][klineObj.timeFrame].currentAtr;
      let capital;
      let fetchBalanceRetry = 0;

      while (true) {
        try {
          StrategyHandlerLog.info('Fetching account balance to determine capital');
          capital = (await this.exchangeObj.fetchBalance()).free.USDT;
          break;
        } catch (error) {
          if (fetchBalanceRetry === 3) {
            StrategyHandlerLog.error(`Could not fetch account balance. Order cannot be placed without capital. ${error}`);
            resetTimeFrameObj(timeFrameObj);
            return;
          }
          StrategyHandlerLog.error(`Could not fetch account balance. Order cannot be placed without capital. Rertrying fetch in 30 seconds... ${error}`);

          await new Promise((resolve) => setTimeout(() => {
            resolve();
          }, 30000));

          fetchBalanceRetry++;
        }
      }


      placeOrder(
          klineObj.symbol,
          this.exchangeName,
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
