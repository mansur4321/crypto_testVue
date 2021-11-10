<template>

	<div class="newCurrency">
		<input
		@keydown.enter="tickerAdd"
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
		<add-button	@click="tickerAdd"/>
	</div>

</template>

<script>
	import addButton from './addButton.vue';

	export default {
		components: {
			addButton,
		},

		data() {
			return {
				ticker: '',
			}
		},

		props: {
			helpValueList: Object,
			warning: String,
		},

		watch: {
			ticker() {
				this.$emit('warning-del-value');
				this.$emit('help-tick-add', this.ticker);
			},
		},

		methods: {
			tickerAdd() {
				this.$emit('add-tick', this.ticker); 
				
				this.ticker = '';
			},

			replace(key) {
				this.ticker = this.helpValueList[key];
				this.tickerAdd();
			},
		},
	}
</script>