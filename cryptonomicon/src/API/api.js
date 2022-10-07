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

let myWorker = new SharedWorker("newWorker.js");
myWorker.port.start();


function nameInParameter(string, val) {
	let nameTicker = string.slice(9);
	return ridOfCurrency(ridOfCurrency(nameTicker, val), val);
}

function ridOfCurrency(nameTicker, val) {
	return nameTicker.replace(`~${val}`, "");
}

function alternativeSubMethod(ticker) {

	if (subscribedTickers.get(name.BTC) == undefined) {
		myWorker.port.postMessage({name: name.BTC, countIn: name.USD, operation: 'sub'});
	}

	myWorker.port.postMessage({name: ticker, countIn: name.BTC, operation: 'sub'});

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

myWorker.port.addEventListener('message', infoMess => {
	let {TYPE, FROMSYMBOL, PRICE, MESSAGE, PARAMETER, TOSYMBOL} = infoMess.data;


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
	

	myWorker.port.postMessage({name: tickerS, countIn: name.USD, operation: 'sub'});
}

export const unsubTicker = tickerD => {
	let countCurrensy = countIn.get(tickerD);

	countIn.delete(tickerD);
	subscribedTickers.delete(tickerD);

	myWorker.port.postMessage({name: tickerD, countIn: countCurrensy, operation: 'unsub'});
}