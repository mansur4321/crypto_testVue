<template>

	<a href="#" 
	@click="exit()"
	v-if="user.login != undefined"
	class="form-ban__btn" >
		exit
	</a>
	<form 
	v-if="user.login == undefined"
	class="form">
		<input
		v-model="login"
		type="text" class="form__login" placeholder="Login">
		<input 
		v-model="parol"
		type="text" class="form__parol" placeholder="Parol">
		<div class="wrapper__btn">
			<a href="#" 
			@click="registration()"
			class="form__reg">
				registration
			</a>

			<a href="#" 
			@click="entry()"
			class="form__entry">
				entry
			</a>
		</div>
	</form>

	<a href="#" 
	v-if="user.isAdmin"
	@click="formBan()"
	class="ban">
		Ban
	</a>

	<form 
	v-if="banFormIndex"
	class="form-ban">
		<input 
		v-model="ban" 
		class="form-ban__input">
		<div>
			<a href="#" 
			@click="banUser()"
			class="form-ban__btn" 
			>banned</a>
		</div>
	</form>		

	<div 
	v-if="user.login != undefined"
	class="wrapper">
		<div class="newCurrency">
			<input
			@keydown.enter="tickerAdd"
			type="text" placeholder="Search" class="newCurrency__add"
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
			href="#" class="newCurrency__btnAdd">Add</a>
		</div>

		<div 
		v-if="tickers.length"
		class="list-currency">
			<div class="filter">
				<div class="filter__page">
					<a 
					v-if="page > 1"
					@click="pageDown"
					class="pageButton-currency-back filter__page_button">Back</a>
					<a 
					v-if="page * 3 < numLastTicker"
					@click="pageUp"
					class="pageButton-currency-next filter__page_button">Next</a>
				</div>

				<div class="filter__coin">
					<input 
					v-model="tickerFilter"
					type="text" class="filter-currency" placeholder="FILTER">
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
				'errorBackground': t.errorBack == 0,
			}">
				<p class="currency__name">{{t.name}} - USD</p>
				<p class="currency__price">{{ formatPrice(t.price) }}</p>
				<div class="btn"><a
				@click="tickerDelete(t.name)"
				href="#" class="currency__btnDel">Delete</a></div>
			</div>
			<hr style="width: 800px;">
		</div>
	</div>		
</template>

<script>

import {subTicker, unsubTicker} from './API/api.js';

import {regUser, regAdmin} from './user.js';

export default {
	data() {
		return {

			users: [],

			user: {},

			login: '',
			parol: '',

			ban: '',
			banFormIndex: false,

			ticker: '',

			tickers: [],

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
		ticker() {
			this.warning_delValue();
			this.help();
		},

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


			return price > 1 ? price.toFixed(2) : price.toPrecision(2);
		},

		updateTicker(tickerNameNew, price) {
			this.tickers
				.filter(t => t.name == tickerNameNew)
					.forEach(t => t.price = price);
		},

		exit() {
			this.user = {};


			if (this.banFormIndex) {
				this.formBan();
			}
		},

		registration() {

			if (this.login == '' || this.parol == '') {
				alert('вы не заполнили строку логина или пароля')
				return
			}

			if (this.login == 'admin' && this.parol == 'admin') {
				this.user = regAdmin(this.login, this.parol);
				
			}else {

				if (this.users.find(user => user.login == this.login)) {
					alert('такой логин уже есть');
					return
				}


				this.user = regUser(this.login, this.parol);
				this.users.push(Object.assign({}, this.user));
			}


			this.nullParLog();
		},

		entry() {

			if (this.login == '' || this.parol == '') {
				alert('вы не заполнили строку логина или пароля')
				return
			}

			if (this.login == 'admin' && this.parol == 'admin') {
				this.user = regAdmin(this.login, this.parol);
			}else {
				if (this.users.find(user => user.login == this.login)) {
					let user = this.users.find(user => user.login == this.login);


					if (user.parol == this.parol) {
						this.user = this.users.find(user => user.login == this.login);
					}
					
					if (this.user.banUser == true) {
						this.user = {};
						alert('Этот пользователь забанен');

						return
					}
				}else {
					alert('Пользователь не зарегистрирован');
				}
			}


			this.nullParLog();
		},

		nullParLog() {
			this.login = '';
			this.parol = '';
		},

		banUser() {
			if (this.ban == '') {
				alert('не указан пользователь');
				return
			}


			this.users.find(user => user.login == this.ban).banUser = true;

		},

		formBan() {
			this.banFormIndex = this.banFormIndex ? false : true;
		},

		tickerAdd() {

			if (this.tickers.find(t => t.name.toUpperCase() == this.ticker.toUpperCase()) == undefined) {
				const newTicker = {
					name: this.ticker,
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
