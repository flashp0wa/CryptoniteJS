const {getExchanges} = require('../Classes/Exchanges/ExchangesClass.js');

/**
 *
 * @param {object} emitter // Event emitter object
 */
function loadListeners(emitter) {
  emitter.on('CreateOrder', (conObj) => {
    console.log(conObj);
    getExchanges()[conObj.exchange].createOrder(conObj);
  });
}

module.exports = {
  loadListeners,
};
