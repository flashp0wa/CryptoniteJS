const {writeToDatabase} = require('../DatabaseConnection/SQLConnector.js');
const {TraderLog} = require('../Toolkit/Logger.js');
const {returnEmitter} = require('../Loaders/EventEmitter.js');
const dataBank = require('../Loaders/LoadDataBank.js');

const globalEvent = returnEmitter();

/**
 * Writes order feedback which resulted in JSON to database
 * @param {object} inObj
 * @param {string} exchange
 */
function processOrderResponse(inObj, exchange) {
  if (!inObj.stopPrice) {
    inObj.stopPrice = 0;
  }
  if (!inObj.fee) {
    inObj.fee = 0;
  }
  if (inObj.side === 'buy') {
    inObj.fee.cost = inObj.fee.cost * inObj.price; // converting fee to USD
  }

  const query = `INSERT INTO Orders VALUES (
    \'${inObj.info.symbol}\', \'${inObj.id}\', \'${inObj.datetime}\',
    \'${inObj.type}\', \'${inObj.side}\', \'${inObj.price}\',
    \'${inObj.stopPrice}\', \'${inObj.amount}\', \'${inObj.cost}\',
    \'${inObj.filled}\', \'${inObj.remaining}\', \'${inObj.status}\',
    \'${inObj.fee.cost}\', \'${exchange}\')`;
  TraderLog.info(`Writing to database. ${query}`);
  writeToDatabase(query);
}

const lastSellOrderCost = dataBank.lastSellOrderCost('get');
/**
 * Calculates the amount of the order based on the given percentage
 * @param {object} inObj
 * @param {object} exchangeObj
 * @return {float}
 */
async function calcOrderVol(inObj, exchangeObj) {
  const {symbol} = inObj;
  const ticker = await exchangeObj.fetchTicker(symbol);
  let orderAmount;

  if (inObj.useLastOrderCost) {
    const newOrderCost = (lastSellOrderCost.get(symbol) / 100) * inObj.orderAmountPercent;
    orderAmount = Math.floor(newOrderCost / ticker.last); // You get the amount of coins you can buy from the last sell trade
  } else {
    const baseAssetName = ticker.symbol.split('/')[0]; // ADA/USDT
    const allAssets = await exchangeObj.fetchBalance();
    const baseAssetVol = allAssets.free[baseAssetName];
    orderAmount = Math.floor((baseAssetVol / 100) * inObj.orderAmountPercent);
  }
  return orderAmount;
}

/**
 * Creates an order on the given exchange(s)
 * @param {object} inObj // Order information object
 */
async function createOrder(inObj) {
  const exchange = dataBank.getCcxtExchange(inObj.exchange);

  const orderAmount = await calcOrderVol(inObj, exchange);

  const orderPrice = inObj.price + (inObj.price * 0.003); // place order 0.3% higher than market price

  switch (inObj.orderType) {
    case 'createMarketOrder':
      try {
        TraderLog.info(`New market order. Symbol: ${inObj.symbol}, Side: ${inObj.side}, Amount: ${orderAmount}, Price: ${orderPrice}`);
        const response = await exchange.createMarketOrder(inObj.symbol, inObj.side, orderAmount, orderPrice);
        globalEvent.emit('SendMail', `New market order. Symbol: ${inObj.symbol}, Side: ${inObj.side}, Amount: ${orderAmount}, Price: ${orderPrice}`);
        processOrderResponse(response, inObj.exchange);
        lastSellOrderCost.set(inObj.symbol, response.cost);
        TraderLog.info(`New market order has been created. Id: ${response.id}`);
      } catch (error) {
        TraderLog.info(`Market order could not be created, here is the error: ${error}`);
      }
      break;

    default:
      break;
  }
}

module.exports = {
  getExchange,
  createOrder,
};
