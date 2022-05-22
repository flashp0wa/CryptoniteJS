function sayMyName() {
  return 'Return This';
}

function* myGen2() {
  let a = yield sayMyName();
  console.log(a);
}

let fasz = myGen2();
fasz.next();
fasz.next(2);


function arr() {
  const lol = new Map();
  lol.set('Lolka', 1);
  lol.set('bolka', 2);

  return lol
}

function* turbi() {
  yield* arr();
  console.log('round')
}

for (const iterator of turbi()) {
  console.log(iterator)
}