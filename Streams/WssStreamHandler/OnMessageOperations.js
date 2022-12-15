// @ts-check
// const {writeToDatabase} = require('../../DatabaseConnection/SQLConnector.js');
// const {returnEmitter} = require('../../Loaders/EventEmitter.js');
// const {ApplicationLog} = require('../../Toolkit/Logger.js');
// const dataBank = require('../../Loaders/LoadDataBank.js');

// const globalEvent = returnEmitter();

const vs_TTQAV = {};
/**
 *
 * @param {object} streamObject
 */
function stream_TotalTradedQuoteAssetVolume(streamObject) {
  const streamType = streamObject.EventType;
  if (streamType === '24hrTicker') {
    /*
        ###### Summary ######

        Shows the direction (increasing/decreasing) of
        the Total Traded Quote Asset Volume of the given symbol.

        ######  Payload ######

        <--------------LINKUSDT-------------->
        Current price: 140850480.69220000
        Volume is increasing.
        Difference: 20.076999992132187.
        Change: 0.000014254122449042228

        ######  Logic  ######

        Part1
        The 'vs_TTQAV' at the first run of the function
        has the property 'incomingValue'
        (the actual TTQAV from the incoming stream object)
        and previousValue (the last TTQAV from the preceding object)
        set to zero. This initializes the object

        Part2
        If there is no 'previousVolume' it means the function is reading
        the first stream object so making it equal
        with the incoming stream object value.
        'vs_TTQAV' will keep
        its data because of module caching through out the stream read.

        Part3
        If the previous value bigger
        than the incoming value the price is decreasing.
        If the previous value smaller than
        the incoming value the price is increasing.
        */


    // Part1
    if (!vs_TTQAV[streamObject.Symbol]) {
      vs_TTQAV[streamObject.Symbol] = {
        incomingVolume: 0,
        previousVolume: 0,
      };
    }

    // Part 2
    let previousVolume = vs_TTQAV[streamObject.Symbol].previousVolume;
    let incomingVolume = vs_TTQAV[streamObject.Symbol].incomingVolume;
    if (previousVolume === 0) {
      previousVolume = streamObject.TotalTradedQuoteAssetVolume;
    } else {
      console.log(`<--------------${streamObject.Symbol}-------------->`);
      incomingVolume = streamObject.TotalTradedQuoteAssetVolume;
      const percentChange = (1 - (previousVolume / incomingVolume)) * 100;
      // Part 3
      console.log(`Current price: ${incomingVolume}`);
      if (incomingVolume > previousVolume) {
        const difference = incomingVolume - previousVolume;
        console.log(`Volume is increasing.
        Difference: ${difference}. 
        Change: ${percentChange}`,
        );
        previousVolume = incomingVolume;
      } else if (incomingVolume < previousVolume) {
        const difference = previousVolume - incomingVolume;
        console.log(`Volume is decreasing.
        Difference: ${difference}.
        Change: ${percentChange}`,
        );
      } else {
        console.log('No change in volume.');
      }
      previousVolume = incomingVolume;
    }
  }
}

// const pw_coinData = new Map();
// const pw_coinSellState = dataBank.pwCoinSellState('get'); // Is the coin sold?
// let pw_baseDate; // The actual day's date when the app initiates, from that on... the day of the price reset
// let pw_resetDate;

// /**
//  * Checks price bursts of the coins. If a token's price goes above or below of a given percentage an order will be created.
//  * @param {object} streamObject
//  */
// async function stream_PriceWatch(streamObject) {
//   const coinsToCheck = [
//     '1INCHDOWNUSDT',
//     'ADADOWN',
//     'AKRO',
//     'BTCDOWN',
//     'BTT',
//     'CKB',
//     'COS',
//     'DENT',
//     'EOSDOWN',
//     'FILDOWN',
//     'FUN',
//     'HOT',
//     'IOST',
//     'KEY',
//     'LINKDOWN',
//     'MBL',
//     'MFT',
//     'NBS',
//     'REEF',
//     'RSR',
//     'SC',
//     'SHIB',
//     'SLP',
//     'STMX',
//     'SUN',
//     'SUSHIUP',
//     'TCTUSDT',
//     'TROYUSDT',
//     'VTHO',
//     'WIN',
//     'XEC',
//     'XLMUP',
//     'XRPDOWN',
//     'XTZUP',
//     'XVG',
//   ];

//   if (coinsToCheck.includes(streamObject.Symbol)) {
//     const today = new Date();
//     const sellPercent = 30; // The amount where the coin should be sold in percentage
//     const buyPercent = -30; // The amount where the coin should be bought back in percentage
//     const baseSymbolPrice = pw_coinData.get(streamObject.Symbol);
//     const currentPrice = streamObject.LastPrice;
//     const currentSymbol = streamObject.Symbol;
//     let currentPercent;

//     ApplicationLog.info(`Current symbol is: ${currentSymbol}`);
//     ApplicationLog.info(`Current price is: ${currentPrice}`);

//     if (!pw_baseDate) {
//       ApplicationLog.info(`First run ... setting base date: ${pw_baseDate}`);
//       pw_baseDate = new Date();
//       pw_resetDate = new Date(pw_baseDate.setDate(pw_baseDate.getDate() + 1)); // Adding one day to current day
//     } else if (today > pw_resetDate) { // reseting baseprice eveyday to avoid long running price percent increase/decrease
//       pw_coinData.set(currentSymbol, currentPrice); // setting new baseprice
//       pw_baseDate = new Date();
//       pw_resetDate = new Date(pw_baseDate.setDate(pw_baseDate.getDate() + 1)); // Adding one day to current day
//     }

//     if (!pw_coinData.has(currentSymbol)) {
//       pw_coinData.set(currentSymbol, currentPrice);
//       ApplicationLog.info(`Adding ${currentSymbol} to Coin Data.`);
//     } else {
//       currentPercent = ((currentPrice - baseSymbolPrice) / baseSymbolPrice ) * 100;
//       ApplicationLog.info(`For symbol: ${currentSymbol} the percent: ${currentPercent}`);
//     }

//     if (currentPercent >= sellPercent) {
//       globalEvent.emit('CreateOrder',
//           {
//             symbol: currentSymbol,
//             price: currentPrice,
//             side: 'sell',
//             exchange: 'binance-test',
//             orderAmountPercent: 98,
//             orderType: 'createMarketOrder',
//           },
//       );


//       pw_coinData.set(currentSymbol, currentPrice); // setting new baseprice
//       pw_coinSellState.delete(currentSymbol);
//       pw_coinSellState.set(currentSymbol, true);
//       const query = `Update PriceWatch set Sold=1 where Symbol=\'${currentSymbol}\'`;
//       writeToDatabase(query);
//     } else if (currentPercent <= buyPercent && pw_coinSellState.get(currentSymbol) === true) {
//       globalEvent.emit('CreateOrder',
//           {
//             symbol: currentSymbol,
//             price: currentPrice,
//             side: 'buy',
//             exchange: 'binance',
//             orderAmountPercent: 80,
//             orderType: 'createMarketOrder',
//             useLastOrderCost: true,
//           },
//       );


//       pw_coinData.set(currentSymbol, currentPrice); // setting new baseprice
//       pw_coinSellState.delete(currentSymbol);
//       pw_coinSellState.set(currentSymbol, false);
//       const query = `Update PriceWatch set Sold=0 where Symbol=\'${currentSymbol}\'`;
//       writeToDatabase(query);
//     } else if (currentPercent <= buyPercent && pw_coinSellState.get(currentSymbol) === false) {
//       // not a peak fall (when the price fall is not from a quick increase/decrease)
//     }
//   }
// }

/**
 *
 * @param {object} inObj Input is an object which has closePrice, openPrice, lowPrice, highPrice properties
 * @return {object} Returns the input object with a `candleTypeId` property
 */
function stream_getCandleType(inObj) {
  const co = inObj.closePrice - inObj.openPrice;
  const hl = inObj.highPrice - inObj.lowPrice;
  const hc = inObj.highPrice - inObj.closePrice;
  const ol = inObj.openPrice - inObj.lowPr2ice;
  const ho = inObj.highPrice - inObj.openPrice;
  const cl = inObj.closePrice - inObj.lowPrice;
  const oc = inObj.openPrice - inObj.closePrice;

  switch (true) {
    case (co) === 0:
    case (hl) === 0:
    case (hc) === 0:
    case (ol) === 0:
    case (ho) === 0:
    case (cl) === 0:
      inObj.candleTypeId = 12;
      return inObj;

    case (0.2 < (co) / (hl)) && ((co) / (hl) < 0.8):
      inObj.candleTypeId = 1;
      return inObj;

    case (0 < (co) / (hl)) && ((co) / (hl) < 0.2) && ((hc) / (ol)) < 0.25:
      inObj.candleTypeId = 2;
      return inObj;

    case (0 < (co) / (hl)) && ((co) / (hl) < 0.2) && ((hc) / (ol)) > 4:
      inObj.candleTypeId = 3;
      return inObj;

    case (0 < (co) / (hl)) && ((co) / (hl) < 0.2) && (0.25 < (hc) / (ol)) && ((hc) / (ol) < 4):
      inObj.candleTypeId = 4;
      return inObj;

    case ((co) / (hl)) > 0.8:
      inObj.candleTypeId = 5;
      return inObj;

    case (0.2 < (oc) / (hl)) && ((oc) / (hl) < 0.8):
      inObj.candleTypeId = 6;
      return inObj;

    case (0 < (oc) / (hl)) && ((oc) / (hl) < 0.2) && ((hc) / (ol)) < 0.25:
      inObj.candleTypeId = 7;
      return inObj;

    case (0 < (oc) / (hl)) && ((oc) / (hl) < 0.2) && ((hc) / (ol)) > 4:
      inObj.candleTypeId = 8;
      return inObj;

    case (0 < (oc) / (hl)) && ((oc) / (hl) < 0.2) && (0.25 < (hc) / (ol)) && ((hc) / (ol) < 4):
      inObj.candleTypeId = 9;
      return inObj;

    case ((oc) / (hl)) > 0.8:
      inObj.candleTypeId = 0;
      return inObj;

    default:
      break;
  }
}

module.exports = {
  stream_TotalTradedQuoteAssetVolume,
  stream_getCandleType,
  // stream_PriceWatch,
};
