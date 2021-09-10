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
				@click="replace(0)"
				>{{helpValueList[0]}}</div>

				<div		
				:class="{
					'dsNone': ticker == '',
					'dcNone': helpValueList[1] == '',
				}"
			 	class="newCurrency__help_elem"
			 	@click="replace(1)"
			 	>{{helpValueList[1]}}</div>

				<div			
				:class="{
					'dsNone': ticker == '',
					'dcNone': helpValueList[2] == '',
				}"
			 	class="newCurrency__help_elem" 
			 	@click="replace(2)"
			 	>{{helpValueList[2]}}</div>

				<div			
				:class="{
					'dsNone': ticker == '',
					'dcNone': helpValueList[3] == '',
				}"
				class="newCurrency__help_elem"
				@click="replace(3)"
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

			page: 1,

			numLastTicker: null,
		};
	},

	computed: {
		amountCoinInPage() {
			return (this.page * 3) - 1;
		} 
	},

	watch: {
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
		const windowData = Object.fromEntries(
			new URL(window.location).searchParams.entries()
		);


		if (windowData.filter) {
			this.tickerFilter = windowData.filter;
		}

		if (windowData.page) {
			this.page = windowData.page;
			console.log(this.page);
		}


		const w = await fetch('https://min-api.cryptocompare.com/data/all/coinlist?summary=true');
		let list = await w.json();

		this.listTicker = list.Data;

		this.tickers = JSON.parse(sessionStorage.tickers);
		this.tickers.forEach(ticker => {
			this.updateValueCoin(ticker.name);
		})

		this.filterCoin();
	},

	methods: {
		updateValueCoin(Tname) {
			setInterval( async () => {
				const s = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${Tname}&tsyms=USD&api_key=b4fa1f778f7b1ea5fb50ac826b38e1eb7268f6d708dcb1cd72811a30d2efc3cc`);
				let value = await s.json();

				this.tickers.find(t => t.name == Tname).price = value.USD;
			}, 10000);
		},

		tickerAdd() {

			if (this.tickers.find(t => t.name.toUpperCase() == this.ticker.toUpperCase()) == undefined) {
				const newTicker = {
					name: this.ticker,
					price: '-'
				}

				this.tickers.push(newTicker);
				this.updateValueCoin(newTicker.name);

				sessionStorage.tickers = JSON.stringify(this.tickers);

				this.ticker = '';
			}else {
				this.warning = 'Такая валюта уже есть';
			}


			this.filterCoin();
		},

		replace(key) {
			this.ticker = this.helpValueList[key];
			this.tickerAdd();
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

		tickerDelete(tickerKey) {
			this.tickers = this.tickers.filter(t => t.name != tickerKey);
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
