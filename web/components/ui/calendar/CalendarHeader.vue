<script setup lang="ts">
import CalendarSeperator from './CalendarSeperator.vue';

defineProps<{
	seperators: Seperator[],
}>()



</script>

<template>
	<div class="flex flex-col h-full w-32">
		<div class="flex justify-center items-center h-18 border-b-text border-b-2">vue-calendar
		</div>
		<div class="calendar-legend relative flex flex-col grow justify-evenly">
			<CalendarSeperator v-for="sep in seperators" :seperator="sep">
				{{ sep.text }}
			</CalendarSeperator>
		</div>
	</div>
</template>

<style scoped></style>
