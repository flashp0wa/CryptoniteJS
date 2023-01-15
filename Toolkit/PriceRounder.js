const {ApplicationLog} = require('./Logger');
/**
 * Rounds the price to predefined precision.
 * @param {*} num
 * @return {*} Returns the rounded number. If the number is too low returns the number in parameter.
 */
function priceRounder(num) {
  switch (true) {
    case num > 100:
      return Math.round(num / 10) * 10;
    case num > 10:
      return num.toFixed(0);
    case num > 1:
      return num.toFixed(1);
    case num > 0.1:
      return num.toFixed(2);
    case num > 0.01:
      return num.toFixed(3);
    case num > 0.001:
      return num.toFixed(4);
    case num > 0.0001:
      return num.toFixed(5);
    case num > 0.00001:
      return num.toFixed(6);
    case num > 0.000001:
      return num.toFixed(7);
    case num > 0.0000001:
      return num.toFixed(8);
    case num > 0.00000001:
      return num.toFixed(9);
    default:
      ApplicationLog.warn('Price too low to round');
      return num;
  }
}

module.exports = {
  priceRounder,
};
