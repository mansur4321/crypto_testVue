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
				}"
				class="newCurrency__help_elem"
				@click="replace(0); tickerAdd();"
				>{{helpValue[0]}}</div>

				<div		
				:class="{
					'dsNone': ticker == '',
				}"
			 	class="newCurrency__help_elem"
			 	@click="replace(1); tickerAdd();"
			 	>{{helpValue[1]}}</div>

				<div			
				:class="{
					'dsNone': ticker == '',
				}"
			 	class="newCurrency__help_elem" 
			 	@click="replace(2); tickerAdd();"
			 	>{{helpValue[2]}}</div>

				<div			
				:class="{
					'dsNone': ticker == '',
				}"
				class="newCurrency__help_elem"
				@click="replace(3); tickerAdd();"
				>{{helpValue[3]}}</div>

			</div>
			<span>{{warning}}</span>
			<a 
			@click="tickerAdd"
			href="#" class="newCurrency__btnAdd">Добавить</a>
		</div>

		<div 
		v-if="tickers.length"
		class="list-currency">
			<hr style="width: 800px;">
			<div 
			v-for="t of tickers"
			@click="sel = t" 
			:key="t.name" 
			class="currency"
			:class="{
				'bdColor': sel == t,
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
				price: ''
			},],

			helpValue: ['','','',''],

			sel: null,

			warning: '',

			listTicker: '',
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
			this.ticker = this.helpValue[key];
		},

		help() {
			let key = 0;


			for (let val in this.listTicker) {

				if(this.listTicker[`${val}`].Symbol.indexOf(`${this.ticker}`) + 1) {

					if (key < 4) {
						this.helpValue[key] = this.listTicker[`${val}`].Symbol;

						key++;
					} else{
						break;
					}
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
