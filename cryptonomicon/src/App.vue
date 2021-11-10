<template>
	<div class="wrapper">
		<add-ticker 
			@add-tick="tickerAdd" 
			:helpValueList="helpValueList"
			@help-tick-add="help"
			@warning-del-value="warning_delValue"
			:warning="warning"
		/>

		<div 
		v-if="tickers.length"
		class="list-currency">

			<div class="filter">
				<div class="filter__page">
					<a 
					v-if="page > 1"
					@click="pageDown"
					class="pageButton-currency-back filter__page_button">back</a>
					<a 
					v-if="page * 3 < numLastTicker"
					@click="pageUp"
					class="pageButton-currency-next filter__page_button">next</a>
				</div>

				<div class="filter__coin">
					<span style="color: #A556B6">FILTER -</span>
					<input 
					v-model="tickerFilter"
					type="text" class="filter-currency">
				</div>
			</div>

			<line-width />

			<div 
			v-for="t of tickers"
			@click="sel = t" 
			:key="t.name" 
			class="currency"
			:class="{
				'bdColor': sel == t,
				'ddNone': t.filter == 0,
				'errorBackground': t.errorBack == 0,
			}">
				<p class="currency__name">{{t.name}} - USD</p>
				<p class="currency__price">{{ formatPrice(t.price) }}</p>
				<div class="btn"><a
				@click="tickerDelete(t.name)"
				href="#" class="currency__btnDel">Удалить</a></div>
			</div>

			<line-width />
		</div>
	</div>		
</template>

<script>

import {subTicker, unsubTicker} from './api.js';

import lineWidth from './components/lineWidth.vue';
import AddTicker from './components/AddTicker.vue';


export default {

	components: {
		lineWidth,
		AddTicker,
	},

	data() {
		return {
			tickers: [{
				name: '',
				price: '',
				filter: 1,
				errorBack: 1,  
			},],

			helpValueList: ['','','',''],

			sel: null,

			warning: '',

			listTicker: '',

			tickerFilter: '',

			page: 1,

			numLastTicker: null,
		};
	},

	computed: {
		amountCoinInPage() {
			return (this.page * 3) - 1;
		},

		
		maxCoinPreviousPage() {
			return (this.page - 1) * 3;
		},

		windowData() {
			return Object.fromEntries(
				new URL(window.location).searchParams.entries()
			);
		},
	},

	watch: {
		tickers() {
			this.filterCoin();
			this.numLastTicker -= 1;


			if (this.numLastTicker < this.maxCoinPreviousPage && this.page != 1) {
				this.pageDown();
			}
		},

		tickerFilter: function() {
			this.page = 1;
			this.filterCoin();

			window.history.pushState(
				null,
				document.title,
				`${window.location.pathname}?filter=${this.tickerFilter}&page=${this.page}`
			);
		},

		page() {
			this.filterCoin();

			window.history.pushState(
				null,
				document.title,
				`${window.location.pathname}?filter=${this.tickerFilter}&page=${this.page}`
			);
		}
	},

	created: async function () {

		if (this.windowData.filter) {
			this.tickerFilter = this.windowData.filter;
		}

		if (this.windowData.page) {
			this.page = this.windowData.page;
		}


		const w = await fetch(
				'https://min-api.cryptocompare.com/data/all/coinlist?summary=true'
			);
		let list = await w.json();

		this.listTicker = list.Data;

		this.tickers = JSON.parse(sessionStorage.tickers);
		this.tickers.forEach( ticker => {
			subTicker(ticker.name, 
					[(tickerName, newPrice) => {
						this.updateTicker(tickerName, newPrice)
					}, (tickerName, key) => {
						this.socketError(tickerName, key)
					}]
				)
			}
		)

		this.filterCoin();
	},

	methods: {
		formatPrice(price) {

			if (price === "-" || price == undefined || price === "") {
				return price;
			}
			console.log(price);

			return price > 1 ? price.toFixed(2) : price.toPrecision(2);
		},

		updateTicker(tickerNameNew, price) {
			this.tickers
				.filter(t => t.name == tickerNameNew)
					.forEach(t => t.price = price);
		},

		tickerAdd(ticker) {

			if (this.tickers.find(t => t.name.toUpperCase() == ticker.toUpperCase()) == undefined) {
				const newTicker = {
					name: ticker,
					price: '-'
				}

				this.tickers.push(newTicker);

				subTicker(newTicker.name, 
					[(tickerName, newPrice) => {
						this.updateTicker(tickerName, newPrice)
					}, (tickerName, key) => {
						this.socketError(tickerName, key)
					}]
				);

				sessionStorage.tickers = JSON.stringify(this.tickers);

			}else {
				this.warning = 'Такая валюта уже есть';
			}


			this.filterCoin();
		},

		help(ticker) {
			let key = 0;


			for (let val in this.listTicker) {

				if(this.listTicker[`${val}`].Symbol.indexOf(`${ticker}`) + 1) {

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


			if (ticker == 0) {

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


			this.filterPage();
		},

		filterPage() {
			let tickersPage = this.tickers.filter(t => t.filter == 1)
			this.numLastTicker = tickersPage.length;


			for (let i = 0; i < tickersPage.length; i++) {

				if (i <= this.amountCoinInPage && i > this.amountCoinInPage - 3) {
					this.tickers.find(t => t.name == tickersPage[i].name).filter = 1;
				} else{
					this.tickers.find(t => t.name == tickersPage[i].name).filter = 0;
				}
			}			
		},

		warning_delValue() {
			this.warning = '';
		},

		socketError(ticker, key) {
			if(key == 0){
				this.tickers.filter(t => t.name == ticker).forEach(t => t.errorBack = 0);
			}else if(key == 1){
				this.tickers.filter(t => t.name == ticker).forEach(t => t.errorBack = 1);
			}
		},

		tickerDelete(tickerKey) {
			this.tickers = this.tickers.filter(t => t.name != tickerKey);
			sessionStorage.tickers = JSON.stringify(this.tickers);

			unsubTicker(tickerKey);
		},

		pageUp() {
			this.page += 1;
		},

		pageDown() {
			this.page -= 1;
		}
	},  
};
</script>

<style src="./app.css">

</style>
