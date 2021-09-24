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


export const subTicker = (tickerS, callback) => {
	subscribedTickers.set(tickerS, callback);
	socket.send(websocketSubMessage(tickerS));
}

export const unsubTicker = tickerD => {
	subscribedTickers.delete(tickerD);
	socket.send(websocketUnsubMessage(tickerD))
}