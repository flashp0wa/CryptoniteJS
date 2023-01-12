/*eslint-disable*/

const { ApplicationLog } = require("../Toolkit/Logger");


// let first = true;

// for (let i = 0; i < arr.length; i++) {
//   if (first) {
//     setTimeout(() => {
//       console.log(arr[i]);
//     }, 10000);
//     first = false;
//   }

//   console.log(arr[i]);
// }

// await new Promise((resolve) => directionsService.route(request, (result, status) => resolve({result, status})));

// function promiseCallback(resolve) {
//   directionsService.route(request, function(result, status) {
//     resolve({result, status});
//   });
// }

// await new Promise(promiseCallback);


// // normal functions
// function foo(x) {
//   return x + 1;
// }

// // arrow functions
// const foo = (x) => {
//   return x + 1;
// };

// // arrow functions with implicit returns
// const foo = (x) => x + 1;

// someFunctionWithACallback(function (result) {
//   doStuffWith(result);
// });

// // vs

// someFunctionWithACallback((result) => doStuffWith(result));

// const date = info.timestamp.split(' ')[0];
// const time = info.timestamp.split(' ')[1];
// const severity = info.level;
// const message = info.message;
// const component = info.label;
// const context = info.function;
// const file = info.file;



const file = 'BTCUSDT-5m-2023-01-10.csv'

console.log(file.split('-')[0]);