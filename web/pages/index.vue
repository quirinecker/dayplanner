<script setup lang="ts">
import Sidebar from '~/components/ui/Sidebar.vue';
import Calendar from '~/components/ui/calendar/Calendar.vue'
import moment, { type Moment } from 'moment';

const todos = ["Staistics", "Computer Graphics", "Webdev"]
const events = ref([])
const date = ref(moment())

onMounted(() => {
	date.value.subtract(10,"days")
})

</script>

<template>
	<div class="h-screen w-screen p-4 flex flex-row gap-5">
		<Sidebar :todos="todos" />
		<div class="flex grow">
			<Calendar v-model:events="events" v-model:date="date"></Calendar>
		</div>
	</div>
</template>


<style scoped></style>
