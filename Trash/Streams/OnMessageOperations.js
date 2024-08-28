// const {writeToDatabase} = require('../../DatabaseConnection/SQLConnector.js');
// const {returnEmitter} = require('../../Loaders/EventEmitter.js');
// const {ApplicationLog} = require('../../Toolkit/Logger.js');
// const dataBank = require('../../Loaders/LoadDataBank.js');

const {ApplicationLog} = require('../../Toolkit/Logger');

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

/**
 *
 * @param {object} inObj Input is an object which has closePrice, openPrice, lowPrice, highPrice properties
 * @return {object} Returns the input object with a `candleTypeId` property
 */
function stream_getCandleType(inObj) {
  const co = inObj.closePrice - inObj.openPrice;
  const hl = inObj.highPrice - inObj.lowPrice;
  const hc = inObj.highPrice - inObj.closePrice;
  const ol = inObj.openPrice - inObj.lowPrice;
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

    case (0.2 < (co) / (hl)) && ((co) / (hl) < 0.8): // NBu
      inObj.candleTypeId = 1;
      return inObj;

    case (0 < (co) / (hl)) && ((co) / (hl) < 0.2) && ((hc) / (ol)) < 0.25: // HBu
      inObj.candleTypeId = 2;
      return inObj;

    case (0 < (co) / (hl)) && ((co) / (hl) < 0.2) && ((hc) / (ol)) > 4: // GBu
      inObj.candleTypeId = 3;
      return inObj;

    case (0 < (co) / (hl)) && ((co) / (hl) < 0.2) && (0.25 < (hc) / (ol)) && ((hc) / (ol) < 4): // DBu
      inObj.candleTypeId = 4;
      return inObj;

    case ((co) / (hl)) > 0.8: // FBu
      inObj.candleTypeId = 5;
      return inObj;

    case (0.2 < (oc) / (hl)) && ((oc) / (hl) < 0.8): // NBe
      inObj.candleTypeId = 6;
      return inObj;

    case (0 < (oc) / (hl)) && ((oc) / (hl) < 0.2) && ((ho) / (cl)) < 0.25: // HBe
      inObj.candleTypeId = 7;
      return inObj;

    case (0 < (oc) / (hl)) && ((oc) / (hl) < 0.2) && ((ho) / (cl)) > 4: // GBe
      inObj.candleTypeId = 8;
      return inObj;

    case (0 < (oc) / (hl)) && ((oc) / (hl) < 0.2) && (0.25 < (ho) / (cl)) && ((ho) / (cl) < 4): // DBe
      inObj.candleTypeId = 9;
      return inObj;

    case ((oc) / (hl)) > 0.8: // FBe
      inObj.candleTypeId = 0;
      return inObj;

    default:
      ApplicationLog.log({
        level: 'warn',
        message: `No candle type has been identified: ${JSON.stringify(inObj)}`,
        senderFunction: 'stream_getCandleType',
        file: 'OnMessageOperations.js',
      });
      inObj.candleTypeId = 14;
      return inObj;
  }
}

module.exports = {
  stream_TotalTradedQuoteAssetVolume,
  stream_getCandleType,
  // stream_PriceWatch,
};
