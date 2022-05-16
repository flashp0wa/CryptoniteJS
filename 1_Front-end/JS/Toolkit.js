async function startBncCoinImport() {
  try {
    const url = 'http://localhost:3000/dataScan/binance/coinDataImport';
    const response = await fetch(url);
    if (response.ok) {
      document.getElementById('bnc-coindata-import').innerHTML = 'Scan started';
      setTimeout(() => {
        document.getElementById('bnc-coindata-import').innerHTML = 'Binance Coin Data Import';
      }, 10000);
    }
  } catch (error) {
    console.log(error);
  }
}

async function newCoinCheck() {
  try {
    const url = 'http://localhost:3000/dataScan/newCoinCheck';
    const response = await fetch(url);
    if (response.ok) {
      document.getElementById('new-coin-check').innerHTML = 'Scan started';
      setTimeout(() => {
        document.getElementById('new-coin-check').innerHTML = 'New Coin Check';
      }, 10000);
    }
  } catch (error) {
    console.log(error);
  }
}

document.getElementById('bnc-coindata-import').addEventListener('click', startBncCoinImport);
document.getElementById('new-coin-check').addEventListener('click', newCoinCheck);
