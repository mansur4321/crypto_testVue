let API_KEY = 'b4fa1f778f7b1ea5fb50ac826b38e1eb7268f6d708dcb1cd72811a30d2efc3cc';


export const loadTicker = tickersName =>
fetch(
	`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickersName.join(',')}&tsyms=USD&api_key=${API_KEY}`
)
.then(r => r.json())
	.then(rawData => Object.fromEntries(
		Object.entries(rawData).map(([key, value]) => [key, value.USD])
	)
);


