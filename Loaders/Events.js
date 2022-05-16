const {returnEmitter} = require('./EventEmitter.js');
const {loadListeners} = require('../Subscribers/LoadListeners.js');
/**
 *
 */
function loadEventListeners() {
  loadListeners(returnEmitter());
}

module.exports = {
  loadEventListeners,
};
