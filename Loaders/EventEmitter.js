const {EventEmitter} = require('events');
let emitter;
/**
 *
 * @return {object} // Event emitter object
 */
function returnEmitter() {
  if (!emitter) {
    emitter = new EventEmitter();
  }

  return emitter;
}

module.exports = {
  returnEmitter,
};
