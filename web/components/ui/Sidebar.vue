<script setup lang="ts">
import { CalendarDate } from '@internationalized/date';
import ListItem from './ListItem.vue';
import Title1 from './Title1.vue';

const selectedDate = shallowRef(new CalendarDate(2024, 6, 29));

const dropDownItems = ref<DropDownMenuItems>([
	{label: "Profile", icon: "i-lucide-user"}
])

defineProps<{
	todos: string[]
}>()

</script>

<template>
	<UCard class="flex w-64 h-full">
		<div class="flex flex-col h-full w-full">
			<header>
				<Title1>Calendar</Title1>
				<UCalendar v-model="selectedDate" />
			</header>
			<div class="flex flex-col grow justify-between">
				<div>
					<Title1>Todos</Title1>
					<div class="flex gap-2 flex-col">
						<ListItem v-for="todo in todos">{{ todo }}</ListItem>
					</div>
				</div>
				<div class="flex">
					<UButton class="w-full flex justify-center">
						+
					</UButton>
				</div>
			</div>
			<footer class="pt-4">
				<UDropdownMenu
					:items="dropDownItems"
					:ui="{
						content: 'w-full'
					}"
				>
					<UButton class="flex gap-1 items-center">
						<UAvatar src="https://github.com/benjamincanac.png" />
						Sebastian Peinbauer
					</Ubutton>
				</UDropdownMenu>
			</footer>
		</div>
	</UCard>
</template>

<style scoped></style>
