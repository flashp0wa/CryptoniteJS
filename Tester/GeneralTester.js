//#region What are Iterators?
// function myIterator(start, finish) {
//   let index = start;
//   let count = 0;

//   return {
//     next() {
//       if (index < finish) {
//         const result = { value: index, done: false};
//         index += 1;
//         count++;
//         return result;
//       }
//       return {
//         value: count,
//         done: true,
//       }
//     }
//   }
// }

// const it = myIterator(5,10);
// let res = it.next();

// while (!res.done) {
//   console.log(res.value);
//   res = it.next();
// }

// console.log(res.value);
//#endregion

// const arr = [0, 1, 2, 3];

// const it = arr[Symbol.iterator]();

// console.log(it.next())
// console.log(it.next())
// console.log(it.next())
// console.log(it.next())
// console.log(it.next())

const map = new Map();
map.set('lolka', 1);
map.set('bolka', 2);
map.set('polka', 3);

const mapIt = map[Symbol.iterator]();
let res = mapIt.next();


while (!res.done) {
  console.log(res.value);
  res = mapIt.next();
}

const data = [
  { name: 'lolka'},
  { name: 'bolka'},
  { name: 'molka'},
  { name: 'polka'}
];

let index = 0;
const lol = { [Symbol.iterator]() {
    return {
      [Symbol.iterator]() {return this;},
      next() {
        const current = data[index];
        index++;
        if (current) {
          return { value: current, done: false}
        } else {
          return { value: current, done: true}
        }
      }
    }
  }
}

for (const iterator of lol) {
  console.log(iterator.name);
}

const lolka = { logger() {
    console.log('David');
  }
}

lolka.logger()