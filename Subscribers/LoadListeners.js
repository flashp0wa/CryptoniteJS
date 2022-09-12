const {sendEmail, sendNewCurrencyEmail} = require('./SendEmail.js');
const {getExchanges} = require('../Classes/Exchanges/ExchangesClass.js');

/**
 *
 * @param {object} emitter // Event emitter object
 */
function loadListeners(emitter) {
  emitter.on('SendEmail', sendEmail);
  emitter.on('SendNewCurrencyEmail', sendNewCurrencyEmail);
  emitter.on('CreateOrder', (conObj) => {
    switch (conObj.orderType) {
      case 'marketOrder':
        getExchanges()[conObj.exchange].createMarketBuyOrder(conObj);
        break;
      case 'limitOrder':
        getExchanges()[conObj.exchange].createLimitBuyOrder(conObj);
        break;
      default:
        break;
    }
  });
}

module.exports = {
  loadListeners,
};
