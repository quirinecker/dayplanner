<script setup lang="ts">
import { DateTime } from 'luxon';
import MainContent from '~/components/ui/MainContent.vue';
import Sidebar from '~/components/ui/Sidebar.vue';

const todos = ["Staistics", "Computer Graphics", "Webdev"]
const events = ref([])
const date = ref<DateTime>(DateTime.now())

</script>

<template>
	<div class="h-screen w-screen p-4 flex flex-row gap-5">
		<Sidebar :todos="todos" v-model:date="date" />
		<MainContent v-model:events="events" v-model:date="date" />
	</div>
</template>


<style scoped></style>
