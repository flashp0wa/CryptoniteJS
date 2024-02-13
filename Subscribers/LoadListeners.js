const {getExchanges} = require('../Classes/Exchanges/ExchangesClass');
const {getCryptoniteWebSocket} = require('../Classes/WebSocket');

/**
 *
 * @param {object} emitter // Event emitter object
 */
function loadListeners(emitter) {
  emitter.on('CreateOrder', (conObj) => {
    getExchanges()[conObj.exchange].createOrder(conObj);
  });
  emitter.on('SendWssMessage', (msg) => {
    getCryptoniteWebSocket().sendMessage(msg);
  });
}

module.exports = {
  loadListeners,
};
