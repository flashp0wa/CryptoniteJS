const {SupportResistanceCandleTreeLog} = require('../Toolkit/Logger');

/**
 * Returns an object with the trade side (buy/sell), strategy id and candle stack. If no match found returns an empty object
 * @param {int} candle1
 * @param {int} candle2
 * @param {int} candle3
 * @param {int} candle4
 * @param {int} candle5
 * @return {object}
 */
function candleTree(candle1, candle2, candle3, candle4, candle5) {
  switch (candle1) {
    case 3:
      switch (true) {
        case (candle2 === 6 && candle3 === 6 || 9 || 0 || 8 ):
          SupportResistanceCandleTreeLog.info('Match found. Side: 1 | ID: 1366');
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
          SupportResistanceCandleTreeLog.info('No match');
          return {};
      }
    case 4:
      switch (true) {
        case (candle2 === 6 && candle3 === 6 || 9 || 0 || 8 ):
          SupportResistanceCandleTreeLog.info('Match found. Side: 1 | ID: 1466');
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
          SupportResistanceCandleTreeLog.info('Match found. Side: 2 | ID: 246155');
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
          SupportResistanceCandleTreeLog.info('Match found. Side: 1 | ID: 1496');
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
          SupportResistanceCandleTreeLog.info('Match found. Side: 1 | ID: 1406');
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
          SupportResistanceCandleTreeLog.info('No match');
          return {};
      }
    case 2:
      switch (true) {
        case (candle2 === 6 && candle3 === 6 || 9 || 0 || 8):
          SupportResistanceCandleTreeLog.info('Match found. Side: 1 | ID: 1266');
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
          SupportResistanceCandleTreeLog.info('Match found. Side: 1 | ID: 1206');
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
          SupportResistanceCandleTreeLog.info('No match found');
          return {};
      }
    case 5:
      switch (true) {
        case (candle2 === 6 && candle3 === 1 || 2 || 5 && candle4 === 5 || 1 || 7 ):
          SupportResistanceCandleTreeLog.info('Match found. Side: 2 | ID: 25615');
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
          SupportResistanceCandleTreeLog.info('Match found. Side: 1 | ID: 1506');
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
          SupportResistanceCandleTreeLog.info('Match found. Side: 2 | ID: 25051');
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
          SupportResistanceCandleTreeLog.info('No match');
          return {};
      }
    case 1:
      switch (true) {
        case (candle2 === 6 && candle3 === 6 || 9 || 0 || 8 ):
          SupportResistanceCandleTreeLog.info('Match found. Side: 1 | ID: 1166');
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
          SupportResistanceCandleTreeLog.info('Match found. Side: 1 | ID: 11636');
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
          SupportResistanceCandleTreeLog.info('Match found. Side: 2 | ID: 21615');
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
          SupportResistanceCandleTreeLog.info('Match found. Side: 1 | ID: 1196');
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
          SupportResistanceCandleTreeLog.info('Match found. Side: 1 | ID: 1106');
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
          SupportResistanceCandleTreeLog.info('Match found. Side: 1 | ID: 11056');
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
          SupportResistanceCandleTreeLog.info('No match found');
          return {};
      }
    case 9:
      switch (true) {
        case (candle2 === 1 && candle3 === 1 || 4 || 5 || 2 ):
          SupportResistanceCandleTreeLog.info('Match found. Side: 1 | ID: 1911');
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
          SupportResistanceCandleTreeLog.info('Match found. Side: 1 | ID: 1941');
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
          SupportResistanceCandleTreeLog.info('Match found. Side: 1 | ID: 1951');
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
          SupportResistanceCandleTreeLog.info('No match found');
          return {};
      }
    case 7:
      switch (true) {
        case (candle2 === 1 && candle3 === 1 || 4 || 5 || 2 ):
          SupportResistanceCandleTreeLog.info('Match found. Side: 1 | ID: 1711');
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
          SupportResistanceCandleTreeLog.info('No match found');
          return {};
      }
    case 8:
      switch (true) {
        case (candle2 === 1 && candle3 === 1 || 4 || 5 || 2 ):
          SupportResistanceCandleTreeLog.info('Match found. Side: 1 | ID: 1811');
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
          SupportResistanceCandleTreeLog.info('No match found');
          return {};
      }
    case 0:
      switch (true) {
        case (candle2 === 1 && candle3 === 6 || 8 || 0 && candle4 === 0 || 6 || 3 ):
          SupportResistanceCandleTreeLog.info('Match found. Side: 2 | ID: 20160');
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
          SupportResistanceCandleTreeLog.info('Match found. Side: 2 | ID: 20506');
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
          SupportResistanceCandleTreeLog.info('No match found');
          return {};
      }
    case 6:
      switch (true) {
        case (candle2 === 1 && candle3 === 1 || 4 || 5 || 2 ):
          SupportResistanceCandleTreeLog('Match found. Side: 1 | ID: 1611');
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
          SupportResistanceCandleTreeLog('Match found. Side: 1 | ID: 16171');
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
          SupportResistanceCandleTreeLog('Match found. Side: 2 | ID: 26160');
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
          SupportResistanceCandleTreeLog('Match found. Side: 1 | ID: 1641');
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
          SupportResistanceCandleTreeLog('Match found. Side: 1 | ID: 1651');
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
          SupportResistanceCandleTreeLog('Match found. Side: 1 | ID: 16501');
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
          SupportResistanceCandleTreeLog.info('No match found');
          return {};
      }
    default:
      SupportResistanceCandleTreeLog.info('No match found');
      return {};
  }
}

module.exports = {
  candleTree,
};
