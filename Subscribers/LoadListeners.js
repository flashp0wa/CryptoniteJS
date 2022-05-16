const {sendEmail, sendNewCurrencyEmail} = require('./SendEmail.js');
const {collectBinanceDataFromCsv} = require('./DataStreamRead.js');
const {Order} = require('../Classes/OrderClass.js');

/**
 *
 * @param {object} emitter // Event emitter object
 */
function loadListeners(emitter) {
  emitter.on('SendEmail', sendEmail);
  emitter.on('SendNewCurrencyEmail', sendNewCurrencyEmail);
  emitter.on('NewBinanceCsv', collectBinanceDataFromCsv);
  emitter.on('CreateOrder', (conObj) => {
    new Order(conObj).createOrder();
  });
}

module.exports = {
  loadListeners,
};
