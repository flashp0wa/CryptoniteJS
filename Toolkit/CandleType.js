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


const a = {
  openPrice: 1914.84000000,
  highPrice: 1918.22000000,
  lowPrice: 1914.08000000,
  closePrice: 1916.56000000,
};

console.log(stream_getCandleType(a));

module.exports = {
  stream_getCandleType,
};
