<script setup lang="ts">
import { CalendarDate } from '@internationalized/date';
import ListItem from './ListItem.vue';
import Title1 from './Title1.vue';
import type { DropdownMenuItem } from '@nuxt/ui';
import type { Moment } from 'moment';
import moment from 'moment';

const dropDownItems = ref<DropdownMenuItem[]>([
	{ label: "Profile", icon: "i-lucide-user" },
	{ label: "Settings", icon: "i-lucide-settings" }
])

const date = defineModel<Moment>('date', { required: true })

const selectedDate = computed({
	get() {
		return new CalendarDate(date.value.year(), date.value.month() + 1, date.value.date())
	},
	set(value) {
		if (value === undefined) {
			return
		}
		date.value = moment(value.toString());
	}
})

defineProps<{
	todos: string[]
}>()

</script>

<template>
	<UCard class="flex w-64 h-full">
		<div class="flex flex-col h-full w-full gap-5">
			<header class="flex flex-col gap-2">
				<Title1>Calendar</Title1>
				<UCalendar v-model="selectedDate" />
			</header>
			<div class="flex flex-col grow justify-between">
				<div class="flex flex-col gap-2">
					<Title1>Todos</Title1>
					<div class="flex gap-2 flex-col">
						<ListItem v-for="todo in todos">{{ todo }}</ListItem>
					</div>
				</div>
				<div class="flex">
					<UButton size="xl" class="w-full flex justify-center">
						+
					</UButton>
				</div>
			</div>
			<footer class="pt-4">
				<UDropdownMenu :items="dropDownItems" size="xl" :ui="{
					content: 'w-60'
				}">
					<UButton variant="ghost" class="flex gap-1 items-center w-full text-text">
						<UAvatar src="https://github.com/benjamincanac.png" />
						Sebastian Peinbauer
					</UButton>
				</UDropdownMenu>
			</footer>
		</div>
	</UCard>
</template>

<style scoped></style>
