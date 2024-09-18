const {getExchanges} = require('../Classes/Exchanges/ExchangesClass');

/**
 *
 * @param {object} emitter // Event emitter object
 */
function loadListeners(emitter) {
  emitter.on('CreateOrder', (conObj) => {
    getExchanges()[conObj.exchange].createOrder(conObj);
  });
}

module.exports = {
  loadListeners,
};
