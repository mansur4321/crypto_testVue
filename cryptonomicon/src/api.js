let API_KEY_SOCKET = 'ef967394f6f8d36a024577928cd403fd5a15cc43e2cf3757642376e8e887c24a';
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY_SOCKET}`);
const aggregateIndex = '5';
const messageError = 'INVALID_SUB';

const keyError = {
	off: 1,
	on: 0,
}
const name = {
	BTC: 'BTC',
	USD: 'USD',
}

let subscribedTickers = new Map();//[название, массив с двумя функциями]
let countIn = new Map();//[название, валюта в которой считаем]
let currensyValueBTC = new Map();//[название, размер валюты в биткойнах]
let priceBTC = 1;

let myWorker = new SharedWorker("./workers/newWorker.js");
myWorker.port.start();


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

function nameInParameter(string, val) {
	let nameTicker = string.slice(9);
	return ridOfCurrency(ridOfCurrency(nameTicker, val), val);
}

function ridOfCurrency(nameTicker, val) {
	return nameTicker.replace(`~${val}`, "");
}

function alternativeSubMethod(ticker) {

	if (subscribedTickers.get(name.BTC) == undefined) {
		socket.send(websocketSubMessage(name.BTC, name.USD));
	}


	socket.send(websocketSubMessage(ticker, name.BTC));
}

function subToCurrensyError(PARAMETER) {
	const sub = subscribedTickers.get(nameInParameter(PARAMETER, name.BTC))

	let error = sub[1];

	error(nameInParameter(PARAMETER, name.BTC), keyError.on);

	return
}

function subToCurrensy(FROMSYMBOL, PRICE) {
	const sub = subscribedTickers.get(FROMSYMBOL);

	let subscribed = sub[0];
	let errorKey = sub[1];

	subscribed(FROMSYMBOL, PRICE);
	errorKey(FROMSYMBOL, keyError.off);

	return
}

myWorker.port.onmessage = function(a) {
	console.log(a);
}

socket.addEventListener('message', infoMess => {
	let {TYPE, FROMSYMBOL, PRICE, MESSAGE, PARAMETER, TOSYMBOL} = JSON.parse(infoMess.data);
	//console.log(infoMess.data);


	// if (!subscribedTickers.has(FROMSYMBOL)) {
	// 	return
	// }

	if (FROMSYMBOL == name.BTC) {
		priceBTC = PRICE;


		currensyValueBTC.forEach((value, key) => {
			subToCurrensy(key, value * priceBTC);
		});
	}

	if (MESSAGE == messageError) {

		if (PARAMETER.indexOf('BTC~BTC') != -1){
			subToCurrensyError(PARAMETER);

			return
		}


		alternativeSubMethod(nameInParameter(PARAMETER, name.USD));

		return
	}

	if (TYPE !== aggregateIndex) {
		return
	}

	if(TOSYMBOL == name.BTC) {
		currensyValueBTC.set(FROMSYMBOL, PRICE)
		PRICE = PRICE * priceBTC;

		subToCurrensy(FROMSYMBOL, PRICE);
		countIn.set(FROMSYMBOL, name.BTC);

		return
	}


	subToCurrensy(FROMSYMBOL, PRICE);
});


export const subTicker = (tickerS, cb_add) => {
	subscribedTickers.set(tickerS, cb_add);
	countIn.set(tickerS, name.USD);

	myWorker.port.postMessage(tickerS);
	socket.send(websocketSubMessage(tickerS, name.USD));
}

export const unsubTicker = tickerD => {
	let countCurrensy = countIn.get(tickerD);

	countIn.delete(tickerD);
	subscribedTickers.delete(tickerD);

	//myWorker.port.postMessage([tickerD, countCurrensy, 'unsub'])[tickerS, name.USD, 'sub']
	socket.send(websocketUnsubMessage(tickerD, countCurrensy));
}


