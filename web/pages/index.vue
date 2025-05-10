<script setup lang="ts">
import Sidebar from '~/components/ui/Sidebar.vue';

const todos = ["Staistics", "Computer Graphics", "Webdev"]


</script>

<template>
	<div class="h-screen w-screen p-4">
		<Sidebar :todos="todos" />
	</div>
</template>


<style scoped></style>
