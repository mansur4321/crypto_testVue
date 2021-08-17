<template>
	<div class="wrapper">
		<div class="newCurrency">
			<input type="text" placeholder="name" class="newCurrency__add">
			<a href="#" class="newCurrency__btnAdd">Добавить</a>
		</div>

		<div class="list-currency">
			<hr style="width: 800px;">
			<div class="currency">
				<p class="currency__name">USD</p>
				<p class="currency__price">-</p>
				<a href="#" class="currency__btnDel">Удалить</a>
			</div>
			<hr style="width: 800px;">
		</div>
	</div>			
</template>

<script>

export default {
  
};
</script>

<style src="./app.css">

</style>
