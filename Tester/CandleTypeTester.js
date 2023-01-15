const obj = JSON.parse('{"openTime":"2023-01-15T08:10:00.000Z","closeTime":"2023-01-15T08:14:59.999Z","symbol":"BTCUSDT","timeFrame":"5m","openPrice":20737.54,"closePrice":20734.22,"highPrice":20740,"lowPrice":20720.09,"numberOfTrades":12657,"quoteAssetVolume":6288673.7134068}');

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
      break;
  }
}

const newObj = stream_getCandleType(obj);
console.log(newObj);