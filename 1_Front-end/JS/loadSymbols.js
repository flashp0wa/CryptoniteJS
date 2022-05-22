import {config} from './config.js'

const exchange = document.getElementById('exchange');
export async function loadSymbols() {
  try {
    let url;
    if (!exchange) {
      url = `${config.BACKEND_URL}/exchange/binance/getSymbols`;
    } else {
      url = `${config.BACKEND_URL}/exchange/${exchange.value}/getSymbols`;
    }
    const symbols = document.getElementById('symbol');

    if (symbols) {
      const option = document.querySelectorAll('#symbol option');
      option.forEach(o => o.remove());
    }

    const symbolResponse = await (await fetch(url)).json();
    symbolResponse.forEach((symbol) => {
      const newOption = document.createElement('option');
      newOption.innerHTML = symbol;
      symbols.appendChild(newOption);
    });
  } catch (error) {
    console.log(`Error while loading symbols. ${error}`);
  }
}

if (exchange) {
  document.getElementById('exchange').addEventListener('change', loadSymbols);
}

