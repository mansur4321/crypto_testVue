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
			:key="t.name"
			class="currency">
				<p class="currency__name">{{t.name}} - USD</p>
				<p class="currency__price">-</p>
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
			},]
		}
	},

	methods: {
		tickerAdd() {
			const newTicker = {
				name: this.ticker,
				price: '-'
			}

			this.tickers.push(newTicker);
		},

		tickerDelete(tickerKey) {
			this.tickers = this.tickers.filter(t => t.name != tickerKey);
		}
	}
  
};
</script>

<style src="./app.css">

</style>
