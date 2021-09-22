let API_KEY = 'b4fa1f778f7b1ea5fb50ac826b38e1eb7268f6d708dcb1cd72811a30d2efc3cc';
let subscribedTickers = new Map();//название, функция

const loadTicker = () =>{//название, новая цена

	if (subscribedTickers.size == 0) {return}


	fetch(
		`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...subscribedTickers.keys()]
			.join(',')}&tsyms=USD&api_key=${API_KEY}`
	)
	.then(r => r.json())
		.then(rawData => {
			const updatePrice = Object.fromEntries(
				Object.entries(rawData).map(([key, value]) => [key, value.USD])
			);

			Object.entries(updatePrice).forEach((arrTickerInform) => {
				const sub = subscribedTickers.get(arrTickerInform[0]) ;
				sub(arrTickerInform[0], arrTickerInform[1]);
			})
		}
	);
}


export const subTicker = (tickerS, callback) => {
	subscribedTickers.set(tickerS, callback);
}

export const unsubTicker = tickerD => {
	subscribedTickers.delete(tickerD);
}


setInterval(() => loadTicker(), 5000);
