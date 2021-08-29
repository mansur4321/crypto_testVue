<template>
	<div class="wrapper">
		<div class="newCurrency">
			<input
			@keydown.enter="tickerAdd"
			@input="warning_delValue(); help();"
			type="text" placeholder="name" class="newCurrency__add"
			v-model="ticker">
			<div 
			class="newCurrency__help">
				<div 
				:class="{
					'dsNone': ticker == '',
					'dcNone': helpValueList[0] == '',
				}"
				class="newCurrency__help_elem"
				@click="replace(0); tickerAdd();"
				>{{helpValueList[0]}}</div>

				<div		
				:class="{
					'dsNone': ticker == '',
					'dcNone': helpValueList[1] == '',
				}"
			 	class="newCurrency__help_elem"
			 	@click="replace(1); tickerAdd();"
			 	>{{helpValueList[1]}}</div>

				<div			
				:class="{
					'dsNone': ticker == '',
					'dcNone': helpValueList[2] == '',
				}"
			 	class="newCurrency__help_elem" 
			 	@click="replace(2); tickerAdd();"
			 	>{{helpValueList[2]}}</div>

				<div			
				:class="{
					'dsNone': ticker == '',
					'dcNone': helpValueList[3] == '',
				}"
				class="newCurrency__help_elem"
				@click="replace(3); tickerAdd();"
				>{{helpValueList[3]}}</div>

			</div>
			<span>{{warning}}</span>
			<a 
			@click="tickerAdd"
			href="#" class="newCurrency__btnAdd">Добавить</a>
		</div>

		<div 
		v-if="tickers.length"
		class="list-currency">
			<span style="color: #A556B6">FILTER -</span>
			<input 
			v-model="tickerFilter"
			@input="filterCoin"
			type="text" class="filter-currency">

			<hr style="width: 800px;">
			<div 
			v-for="t of tickers"
			@click="sel = t" 
			:key="t.name" 
			class="currency"
			:class="{
				'bdColor': sel == t,
				'ddNone': t.filter == 0,
			}">
				<p class="currency__name">{{t.name}} - USD</p>
				<p class="currency__price">{{t.price}}</p>
				<div class="btn"><a
				@click="tickerDelete(t.name)"
				href="#" class="currency__btnDel">Удалить</a></div>
			</div>
			<hr style="width: 800px;">
		</div>
	</div>			
</template>

<script>

export default {
	data() {
		return {
			ticker: '',

			tickers: [{
				name: '',
				price: '',
				filter: 1,
			},],

			helpValueList: ['','','',''],

			sel: null,

			warning: '',

			listTicker: '',

			tickerFilter: '',
		};
	},

	created: async function () {
		const w = await fetch('https://min-api.cryptocompare.com/data/all/coinlist?summary=true');
		let list = await w.json();

		this.listTicker = list.Data;
		console.log(this.listTicker);
	},

	methods: {
		tickerAdd() {

			if (this.tickers.find(t => t.name.toUpperCase() == this.ticker.toUpperCase()) == undefined) {
				const newTicker = {
					name: this.ticker,
					price: '-'
				}

				this.tickers.push(newTicker);

				setInterval( async () => {
					const s = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${newTicker.name}&tsyms=USD&api_key=b4fa1f778f7b1ea5fb50ac826b38e1eb7268f6d708dcb1cd72811a30d2efc3cc`);
					let value = await s.json();

					this.tickers.find(t => t.name == newTicker.name).price = value.USD;
				}, 500);

				this.ticker = '';
			}else {
				this.warning = 'Такая валюта уже есть';
			}
		},

		replace(key) {
			this.ticker = this.helpValueList[key];
		},

		help() {
			let key = 0;


			for (let val in this.listTicker) {

				if(this.listTicker[`${val}`].Symbol.indexOf(`${this.ticker}`) + 1) {

					if (key < 4) {
						this.helpValueList[key] = this.listTicker[`${val}`].Symbol;

						key++;


						if (key < 4) {	

							for (let i = key; i < 4; i++) {
								this.helpValueList[i] = '';
							}
						}
					} else{
						break;
					}
				}
			}


			if (this.ticker == 0) {
				for (let i = 0; i < 4; i++) {
					this.helpValueList[i] = '';
				}
			}
		},

		filterCoin() {

			for (var i = 0; i < this.tickers.length; i++) {
				const upperCoin = this.tickers[i].name.toUpperCase();

				if (upperCoin.indexOf(this.tickerFilter.toUpperCase()) + 1) {
					this.tickers[i].filter = 1;
				} else{
					this.tickers[i].filter = 0;
				}
			}
		},

		warning_delValue() {
			this.warning = '';
		},

		tickerDelete(tickerKey) {
			this.tickers = this.tickers.filter(t => t.name != tickerKey);
		}
	},  
};
</script>

<style src="./app.css">

</style>
