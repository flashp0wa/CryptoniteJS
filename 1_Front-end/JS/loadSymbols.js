const exchange = document.getElementById('exchange');
export async function loadSymbols() {
  try {
    let url;
    if (!exchange) {
      url = `http://localhost:3000/exchange/binance/getSymbols`;
    } else {
      url = `http://localhost:3000/exchange/${exchange.value}/getSymbols`;
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

