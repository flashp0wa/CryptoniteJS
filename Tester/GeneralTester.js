async function promiseTest() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('I resolved fucker!');
    }, 1);
  });
};

(async () => {
  const stuff = promiseTest();

  console.log(stuff.state === 'fulfilled');
  console.log(stuff.state);
})();

let lol;

console.log(typeof lol);
