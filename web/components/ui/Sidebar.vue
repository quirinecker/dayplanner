<script setup lang="ts">
import { CalendarDate } from '@internationalized/date';
import ListItem from './ListItem.vue';
import Title1 from './Title1.vue';
import type { DropdownMenuItem } from '@nuxt/ui';
import { DateTime } from 'luxon';

const colorMode = useColorMode();
const toast = useToast()

const currentTheme = ref<'dark' | 'system' | 'light'>(colorMode.preference as 'dark' | 'system' | 'light');
const showTaskFormModal = ref(false);
const taskFormModalInput = ref<Partial<Task>>({});

const date = defineModel<DateTime>('date', { required: true })
const tasks = defineModel<Task[]>('tasks', { required: true })

const emits = defineEmits<{
	(e: 'createTask', name: string): void
	(e: 'deleteTask', id: number): void
	(e: 'editTask', task: Task): void
}>()

const isLight = computed(() => currentTheme.value === 'light');
const isDark = computed(() => currentTheme.value === 'dark');
const isSystem = computed(() => currentTheme.value === 'system');
const doneTasks = computed(() => tasks.value.filter(task => task.done))
const todoTasks = computed(() => tasks.value.filter(task => !task.done))

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

function addTask() {
	const name = prompt("Todo name:")
	console.log(name)
	if (name !== null) {
		emits('createTask', name)
	}
}
function deleteTask(todo: Task) {
	if (todo.id === undefined) {
		toast.add({
			title: "Task does not exist anymore"
		})
		return
	}

	emits('deleteTask', todo.id)
}
function editTask(task: Task) {
	emits('editTask', task)
}

function openTaskFormModal(task: Partial<Task>) {
	taskFormModalInput.value = task
	showTaskFormModal.value = true
}

</script>

<template>
	<UCard class="flex w-64 h-full" :ui="{ body: 'w-full' }">
		<UiTaskFormModal v-model:open="showTaskFormModal" :input="taskFormModalInput" action="create" />

		<div class="flex flex-col h-full w-full gap-5">
			<header class="flex flex-col gap-2">
				<Title1>Calendar</Title1>
				<UCalendar v-model="selectedDate" />
			</header>
			<div class="flex flex-col grow justify-between">
				<div class="flex flex-col gap-2">
					<Title1>Todos</Title1>
					<div class="flex gap-2 flex-col">
						<ListItem v-for="task in todoTasks">
							<div class="flex w-full gap-4 items-center">
								<span
									class="grow overflow-scroll py-3 overflow-shadow flex flex-row gap-2 items-center">
									<UCheckbox v-model="task.done" @change="() => editTask(task)" />{{ task.title }}
								</span>
								<div class="flex gap-1">
									<UButton size="xs" color="neutral" class="flex justify-center"
										icon="mingcute:pencil-line" @click="() => editTask(task)" />
									<UButton size="xs" color="primary" class="flex justify-center"
										icon="octicon:trashcan-16" @click="() => deleteTask(task)" />
								</div>
							</div>
						</ListItem>
						<USeparator label="Done" v-if="todoTasks.length !== 0" />
						<ListItem v-for="task in doneTasks">
							<div class="flex w-full gap-4 items-center">
								<span
									class="grow overflow-scroll py-3 overflow-shadow flex flex-row gap-2 items-center">
									<UCheckbox v-model="task.done" @change="() => editTask(task)" />{{ task.title }}
								</span>
								<div class="flex gap-1">
									<UButton size="xs" color="neutral" class="flex justify-center"
										icon="mingcute:pencil-line" @click="() => editTask(task)" />
									<UButton size="xs" color="primary" class="flex justify-center"
										@click="() => deleteTask(task)" icon="octicon:trashcan-16" />
								</div>
							</div>
						</ListItem>
					</div>
				</div>
				<div class="flex">
					<UButton size="xl" class="w-full flex justify-center" @click="() => openTaskFormModal({})">
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
