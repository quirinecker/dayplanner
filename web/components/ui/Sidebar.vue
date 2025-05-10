<script setup lang="ts">
import { CalendarDate } from '@internationalized/date';
import Title1 from './Title1.vue';
import { UCard } from '#components';

const selectedDate = shallowRef(new CalendarDate(2024, 6, 29));

defineProps<{
	todos: string[]
}>()

</script>

<template>
	<UCard class="w-64 h-full">
		<template #header>
			<Title1>Calendar</Title1>
			<UCalendar v-model="selectedDate" />
		</template>
		<template #default>
			<Title1>Todos</Title1>
			<div class="flex gap-2 flex-col">
				<UCard v-for="todo in todos">{{ todo }}</UCard>
			</div>
		</template>
	</UCard>
</template>

<style scoped></style>
