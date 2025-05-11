<script setup lang="ts">
import { CalendarDate } from '@internationalized/date';
import ListItem from './ListItem.vue';
import Title1 from './Title1.vue';

const selectedDate = shallowRef(new CalendarDate(2024, 6, 29));

defineProps<{
	todos: string[]
}>()

</script>

<template>
	<UCard class="w-64 h-full">
		<template #header class="flex flex-col gap-2">
			<Title1>Calendar</Title1>
			<UCalendar v-model="selectedDate" />
		</template>
		<template #default class="flex-col gap-2">
			<Title1>Todos</Title1>
			<div class="flex gap-2 flex-col">
				<ListItem v-for="todo in todos">{{ todo }}</ListItem>
			</div>
			<UButton class="flex w-full justify-center ga">
				+
			</UButton>
		</template>
	</UCard>
</template>

<style scoped></style>
