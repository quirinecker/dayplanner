<script setup lang="ts">
import { CalendarDate } from '@internationalized/date';
import ListItem from './ListItem.vue';
import Title1 from './Title1.vue';
import type { DropdownMenuItem } from '@nuxt/ui';
import type { Moment } from 'moment';
import moment from 'moment';

const colorMode = useColorMode();
const currentTheme = ref<'dark' | 'system' | 'light'>(colorMode.preference as 'dark' | 'system' | 'light');

const isLight = computed(() => currentTheme.value === 'light');
const isDark = computed(() => currentTheme.value === 'dark');
const isSystem = computed(() => currentTheme.value === 'system');

watch(currentTheme, () => {
	console.log(currentTheme.value)
	colorMode.preference = currentTheme.value;
})

const dropDownItems = computed<DropdownMenuItem[][]>(() => [
	[
		{ label: "Profile", icon: "i-lucide-user" },
		{ label: "Settings", icon: "i-lucide-settings" }
	],
	[
		{
			label: "light",
			icon: "i-lucide-sun",
			type: 'checkbox' as const,
			checked: isLight.value,
			onUpdateChecked(checked) {
				currentTheme.value = checked ? 'light' : 'system'
			}
		},
		{
			label: "dark",
			icon: "i-lucide-moon",
			onSelect: (e) => console.log(e),
			type: 'checkbox' as const,
			checked: isDark.value,
			onUpdateChecked(checked) {
				currentTheme.value = checked ? 'dark' : 'system'
			}
		},
		{
			label: "system",
			icon: "i-lucide-monitor-cog",
			onSelect: (e) => console.log(e),
			type: 'checkbox' as const,
			checked: isSystem.value,
			onUpdateChecked(checked) {
				currentTheme.value = checked ? 'system' : 'system'
			}
		}
	]
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
						<UAvatar
							src="https://avatars.githubusercontent.com/u/33062936?s=400&u=9ee792d29ebcacccdbfb5af0539aab313d6d7185&v=4" />
						Quirin Ecker
					</UButton>
				</UDropdownMenu>
			</footer>
		</div>
	</UCard>
</template>

<style scoped></style>
