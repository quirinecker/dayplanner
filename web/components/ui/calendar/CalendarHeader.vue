<script setup lang="ts">
import CalendarSeperator from './CalendarSeperator.vue';

defineProps<{
	seperators: Seperator[],
}>()



</script>

<template>
	<div class="flex flex-col h-full grow">
		<div class="flex justify-center items-center bg-gray-600 h-18 text-white border-b-white border-b-2">vue-calendar
		</div>
		<div class="calendar-legend bg-gray-600 text-white relative flex flex-col grow justify-evenly">
			<CalendarSeperator v-for="sep in seperators" :seperator="sep">
				{{ sep.text }}
			</CalendarSeperator>
		</div>
	</div>
</template>

<style scoped></style>
