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
    console.log(conObj);
    getExchanges()[conObj.exchange].createOrder(conObj);
  });
}

module.exports = {
  loadListeners,
};
