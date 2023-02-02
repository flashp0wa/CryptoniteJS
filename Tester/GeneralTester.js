/*eslint-disable*/

const obj = {
  date: 'a',
  time: 'b',
};

switch (true) {
  case obj.date === 'a':
    console.log('date');
  case obj.time === 'b':
    console.log('time');
  case obj.level:
    console.log('level');
    break;

  default:
    break;
}

