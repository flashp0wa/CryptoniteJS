const sendMail = require('../Toolkit/Mailer.js');
/**
 *
 * @param {string} payload // The message of the email
 */
function sendEmail(payload) {
  if (typeof payload === 'string') {
    sendMail.sendMailNotification('Cryptonite Notification', payload);
  }
}
/**
 *
 * @param {map} inputMap // a Map() object
 */
function sendNewCurrencyEmail(inputMap) {
  message = '';
  function buildMsg(key, value, map) {
    message+= `New currencies found on Exchange: ${value} Currency: ${key} | `;
  }
  inputMap.forEach(buildMsg);
  sendMail.sendMailNotification('Cryptonite Notification', message);
}

module.exports = {
  sendEmail,
  sendNewCurrencyEmail,
};
