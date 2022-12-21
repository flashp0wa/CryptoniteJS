const {CreateMarketBuyOrder} = require('./Order/CreateMarketBuyOrderClass');
const {CreateLimitBuyOrder} = require('./Order/CreateLimitBuyOrderClass');
const {ApplicationLog} = require('../../../Toolkit/Logger');
const {sproc_AddSymbolToDatabase, sproc_UpdateOrderSell, sproc_UpdateOrderBuy, singleRead} = require('../../../DatabaseConnection/SQLConnector');
// const [downloadHistoryData] = require('../../../Toolkit/BncHistoryDownload');


class BinanceClass {
  constructor(exchangeName) {
    this.exchangeName = exchangeName;
    this.markets;
    this.symbolList = [];
    this.exchangeId;
  }

  /**
   * Loads current open orders from the database and checks it's states fetching binance. If state changed updates database.
   */
  async checkOrderStatus() {
    try {
      this.exchangeId = await this.getExchangeId();
      const buyOrders = await singleRead(`select * from itvf_ReturnBuyOrders('closed', ${this.exchangeId})`);
      const sellOrders = await singleRead(`select * from itvf_ReturnSellOrders('closed', ${this.exchangeId})`);
      for (const order of sellOrders) {
        try {
          const res = await this.exchangeObj.fetchOrder(order.orderId, order.symbol);
          if (res.status === 'closed') {
            if (!res.fee) {
              sproc_UpdateOrderSell({
                filled: res.filled,
                cost: res.cost,
                orderStatus: res.orderStatus,
                tradeStatus: res.tradeStatus,
                orderId: res.orderId,
              });
            }
          }
          if (res.status === 'canceled') {
            sproc_UpdateOrderSell({
              orderStatus: res.orderStatus,
              tradeStatus: res.tradeStatus,
              orderId: res.orderId,
            });
          }
        } catch (error) {
          ApplicationLog.error(`Could not fetch orders to check trade status. ${error.stack}`);
        }
      }
      for (const order of buyOrders) {
        try {
          const res = await this.exchangeObj.fetchOrder(order.orderId, order.symbol);
          if (res.status === 'canceled' || res.status === 'closed') {
            sproc_UpdateOrderBuy({
              orderStatus: res.status,
              tradeStatus: res.info.status,
              orderId: res.orderId,
              fee: res.fee,
              cost: res.cost,
            });
          }
        } catch (error) {
          ApplicationLog.error(`Could not fetch orders to check trade status. ${error.stack}`);
        }
      }
    } catch (error) {
      ApplicationLog.error(`Error while checking order status: ${error.stack}`);
    }
  }
  /**
   * Loads CCXT exchange market data
   */
  async loadMarkets() {
    ApplicationLog.info(`Loading ${this.exchangeName} markets...`);
    try {
      this.markets = await this.exchangeObj.loadMarkets();
    } catch (error) {
      ApplicationLog.error(`Loading binance market data failed...${error.stack}`);
    }
  }
  /**
   * Loads symbols available on the exchange
   */
  loadSymbols() {
    try {
      if (this.symbolList.length !== 0) {
        this.symbolList = [];
      }
      for (const market of Object.keys(this.markets)) {
        const actualSymbol = this.markets[market].info.symbol;
        this.symbolList.push(actualSymbol);
        sproc_AddSymbolToDatabase(actualSymbol, this.exchangeId);
      }
    } catch (error) {
      ApplicationLog.warn(`Loading symbols failed...${error.stack}`);
    }
  }
  /**
   *
   * @param {object} conObj Constructor object containing order details
   * { symbol, side, orderType, orderAmount, buyPrice, }
   */
  createMarketBuyOrder(conObj) {
    new CreateMarketBuyOrder(this.exchangeObj, conObj).createOrder();
  }
  /**
   *
   * @param {object} conObj Constructor object containing order details
   * { symbol, side, orderType, orderAmount, buyPrice, }
   */
  createLimitBuyOrder(conObj) {
    new CreateLimitBuyOrder(this.exchangeObj, conObj).createOrder();
  }
  /**
   *
   * @return {int} Returns the exchange ID
   */
  async getExchangeId() {
    const response = await singleRead(`select * from itvf_GetExchangeId('${this.exchangeName}')`);
    return response[0].exchangeId;
  }
}

module.exports = {
  BinanceClass,
};
