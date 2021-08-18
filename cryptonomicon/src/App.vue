<template>
	<div class="wrapper">
		<div class="newCurrency">
			<input
			@keydown.enter="tickerAdd"
			type="text" placeholder="name" class="newCurrency__add"
			v-model="ticker">
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
			sel: null,
		};
	},

	methods: {
		tickerAdd() {
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
		},

		tickerDelete(tickerKey) {
			this.tickers = this.tickers.filter(t => t.name != tickerKey);
		}
	}
  
};
</script>

<style src="./app.css">

</style>
