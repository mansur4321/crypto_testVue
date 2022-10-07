let API_KEY_SOCKET = 'ef967394f6f8d36a024577928cd403fd5a15cc43e2cf3757642376e8e887c24a';
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY_SOCKET}`);

const indexOperation = {
	sub: 'sub',
	unsub: 'unsub',
}

let connections = 0;


function websocketSubMessage(ticker, countCurrensy) {
	return JSON.stringify({
	    "action" : "SubAdd",
	    subs : [`5~CCCAGG~${ticker}~${countCurrensy}`],
	})
}

function websocketUnsubMessage(ticker, countCurrensy) {
	return JSON.stringify({
	    "action" : "SubRemove",
	    subs : [`5~CCCAGG~${ticker}~${countCurrensy}`],
	})
}


self.addEventListener('connect', (e) => {
	var port = e.ports[0];
	connections++;
	

	port.addEventListener('message', (dataCur) => {
		let {name, countIn, operation} = dataCur.data;
		console.log(name, countIn)

		if (operation == indexOperation.sub) {
			socket.send(websocketSubMessage(name, countIn));
		}else if(operation == indexOperation.unsub) {
			socket.send(websocketUnsubMessage(name, countIn));
		}
	});

	socket.addEventListener('message', dataMess => {
		port.postMessage(JSON.parse(dataMess.data));
	})

	port.start()
});