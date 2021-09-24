let API_KEY = 'b4fa1f778f7b1ea5fb50ac826b38e1eb7268f6d708dcb1cd72811a30d2efc3cc';
let API_KEY_SOCKET = 'ef967394f6f8d36a024577928cd403fd5a15cc43e2cf3757642376e8e887c24a';
const aggregateIndex = '5';
let subscribedTickers = new Map();//[название, функция]
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY_SOCKET}`);

function websocketSubMessage(ticker) {
	return JSON.stringify({
	    "action" : "SubAdd",
	    subs : [`5~CCCAGG~${ticker}~USD`],
	})
}

function websocketUnsubMessage(ticker) {
	return JSON.stringify({
	    "action" : "SubRemove",
	    subs : [`5~CCCAGG~${ticker}~USD`],
	})
}

socket.addEventListener('message', (infoMess) => {
	let { TYPE, FROMSYMBOL, PRICE} = JSON.parse(infoMess.data);


	if (TYPE !== aggregateIndex) {
		return
	}


	const sub = subscribedTickers.get(FROMSYMBOL);
	sub(FROMSYMBOL, PRICE);
});

const loadTicker = () =>{//[название, новая цена]

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

			Object.entries(updatePrice).forEach(arrTickerInform => {
				const sub = subscribedTickers.get(arrTickerInform[0]) ;
				sub(arrTickerInform[0], arrTickerInform[1]);
			})
		}
	);
}


export const subTicker = (tickerS, callback) => {
	subscribedTickers.set(tickerS, callback);
	socket.send(websocketSubMessage(tickerS));
}

export const unsubTicker = tickerD => {
	subscribedTickers.delete(tickerD);
	socket.send(websocketUnsubMessage(tickerD))
}


setInterval(() => loadTicker(), 5000);
