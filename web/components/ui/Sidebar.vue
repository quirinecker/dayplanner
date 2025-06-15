<script setup lang="ts">
import { CalendarDate } from '@internationalized/date';
import ListItem from './ListItem.vue';
import Title1 from './Title1.vue';
import type { DropdownMenuItem } from '@nuxt/ui';
import { DateTime } from 'luxon';

const colorMode = useColorMode();
const currentTheme = ref<'dark' | 'system' | 'light'>(colorMode.preference as 'dark' | 'system' | 'light');

const isLight = computed(() => currentTheme.value === 'light');
const isDark = computed(() => currentTheme.value === 'dark');
const isSystem = computed(() => currentTheme.value === 'system');

watch(currentTheme, () => {
	console.log(currentTheme.value)
	colorMode.preference = currentTheme.value;
})

const emits = defineEmits<{
	(e: 'createTask', name: string): void
	(e: 'deleteTask', id: number): void
}>()

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

const date = defineModel<DateTime>('date', { required: true })

const selectedDate = computed({
	get() {
		return new CalendarDate(date.value.year, date.value.month, date.value.day)
	},
	set(value) {
		if (value === undefined) {
			return
		}
		date.value = DateTime.fromISO(value.toString());
	}
})

type Task = {
  id: number
  userid: string
  title: string
  description: string
  done: number
  estimated_time: string
  due_date: string
  created_at: string
  updated_at: string
}

defineProps<{
  todos: Task[]
}>()


function addTodo() {
	const name = prompt("Todo name:")
	console.log(name)
	if (name !== null) {
		emits('createTask', name)
	}
}
function deleteTodo(todo: Task) {
	console.log(todo.id)
	emits('deleteTask', todo.id)
}
function editTodo() {

}

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
						<ListItem v-for="todo in todos">
							<div class="flex justify-between">
								<span>
									{{ todo.title }}
								</span>
								<div class="flex gap-1">
									<UButton size="xs" color="neutral" class="flex justify-center" @click="editTodo">
										<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>
									</UButton>
									<UButton size="xs" class="flex justify-center" color="primary" @click="() => deleteTodo(todo)">
										<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-2 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
									</UButton>
								</div>
							</div>
					</ListItem>
					</div>
				</div>
				<div class="flex">
					<UButton size="xl" class="w-full flex justify-center" @click="addTodo">
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
