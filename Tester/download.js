async function lol() {
  await new Promise((resolve) => setTimeout(() => {
    resolve(console.log('David'));
  }, 10000));
}

lol();

