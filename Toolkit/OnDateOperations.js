const _ = require('lodash');

/**
 *
 * @param {Date} smallerDate // Date object to compare
 * @param {Date} biggerDate // Date object to compare
 * @return {Boolean} // True or false
 */
function compareDatum(smallerDate, biggerDate) {
  const smallDate = new Date(smallerDate.toISOString().slice(0, 10));
  const bigDate = new Date(biggerDate.toISOString().slice(0, 10));

  if (smallDate < bigDate) {
    return true;
  } else {
    return false;
  }
}
/**
 *
 * @param {Date} beginDate // Date object
 * @param {Date} endDate // Date object
 * @param {String} format // ms, hr, min
 * @return {Integer}
 */
function getTimeBetweenDates(beginDate, endDate, format = 'minutes') {
  let returnValue;
  const diffMs = (endDate - beginDate); // ms between begin and end date
  const diffDays = Math.floor(diffMs / 86400000); // days
  const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
  const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // mins
  switch (format) {
    case 'days':
      returnValue = diffDays;
      break;
    case 'hours':
      returnValue = diffHrs;
      break;
    case 'minutes':
      returnValue = diffMins;
      break;
    default:
      // Can't happen
      break;
  }

  return returnValue;
}
/**
 *
 * @param {date} start
 * @param {date} end
 * @param {string} dateType // daily or monthly
 * @return {array}
 */
function getDatesArray(start, end, dateType) {
  dates = [];

  for (let dt=new Date(start); dt<=new Date(end); dt.setDate(dt.getDate()+1)) {
    dates.push(new Date(dt));
  }
  if (dateType === 'days') {
    const datesFormated = dates.map((v)=>v.toISOString().slice(0, 10));
    return datesFormated;
  } else {
    const datesFormated = dates.map((v)=>v.toISOString().slice(0, 7));
    return _.uniq(datesFormated);
  }
}


module.exports = {
  compareDatum,
  getTimeBetweenDates,
  getDatesArray,
};
