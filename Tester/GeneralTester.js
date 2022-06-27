const {getDatesArray} = require('../Toolkit/OnDateOperations.js');


startDate = new Date('2021-05-04');
endDate = new Date();
nextMonth = new Date(startDate);
nextMonth.setMonth(nextMonth.getMonth() + 1);
nextMonth.setDate(1);

const datesArr = [];

console.log();

if (startDate.getDate() > 1) {
  const tdatesArr = getDatesArray(startDate, nextMonth, 'days');
  tdatesArr.pop();
  datesArr.push(tdatesArr);
}
