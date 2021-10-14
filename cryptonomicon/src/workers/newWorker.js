onconnect = function(e) {
	var port = e.ports[0];

	port.onmessage = (dataArr) => {
		a = dataArr + '$$$$$$$$$$';
		port.postMessage('hi');
		port.postMessage(a);
	}

}