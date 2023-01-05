async function pause(time) {
  return new Promise((resolve) => setTimeout(() => {
    resolve(requestCount = 0);
  }, time));
}

module.exports = {
  pause,
};
