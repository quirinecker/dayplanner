<script setup lang="ts">
import { CalendarDate } from '@internationalized/date';
import ListItem from './ListItem.vue';
import Title1 from './Title1.vue';
import type { DropdownMenuItem } from '@nuxt/ui';
import { DateTime } from 'luxon';

const colorMode = useColorMode();
const toast = useToast()
const auth = useAuth()
const clerk = useClerk()
const user = useUser()

const currentTheme = ref<'dark' | 'system' | 'light'>(colorMode.preference as 'dark' | 'system' | 'light');
const showTaskCreateModal = ref(false);
const showTaskEditModal = ref(false);
const taskFormModalInput = ref<Partial<Task>>({});
const showDeleteModal = ref(false);
const deleteContext = ref<Task>();
const editContext = ref<Task>();

const date = defineModel<DateTime>('date', { required: true })
const tasks = defineModel<Task[]>('tasks', { required: true })

const emits = defineEmits<{
	(e: 'createTask', task: Task): void
	(e: 'deleteTask', id: number): void
	(e: 'editTask', task: Task): void
	(e: 'scheduleTask', task: Task): void
	(e: 'dismissSchedule'): void
}>()

const isLight = computed(() => currentTheme.value === 'light');
const isDark = computed(() => currentTheme.value === 'dark');
const isSystem = computed(() => currentTheme.value === 'system');
const doneTasks = computed(() => tasks.value.filter(task => task.done))
const todoTasks = computed(() => tasks.value.filter(task => !task.done))

const dropDownItems = computed<DropdownMenuItem[][]>(() => [
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
	],
	[
		{ label: "Profile", icon: "i-lucide-user", onSelect: () => clerk.value?.openUserProfile() },
		{
			label: 'Logout', icon: 'material-symbols:logout', onSelect: () => {
				auth.signOut.value()
				navigateTo('/login')
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

watch(currentTheme, () => {
	colorMode.preference = currentTheme.value;
})

function addTask(task: Task) {
	tasks.value.push(task)
	console.log(tasks.value)
	emits('createTask', task)
}
function deleteTask() {
	if (deleteContext.value === undefined || deleteContext.value.id === undefined) {
		toast.add({
			title: "Task does not exist anymore"
		})
		return
	}

	tasks.value = tasks.value.filter(t => t.id !== (deleteContext.value?.id ?? -1))

	emits('deleteTask', deleteContext.value.id)
	deleteContext.value = undefined
	showDeleteModal.value = false
}

function editTask(task: Task) {
	editContext.value?.updateWithOtherTask(task)
	emits('editTask', task)
}

function openTaskFormModal(task: Partial<Task>) {
	taskFormModalInput.value = task
	showTaskCreateModal.value = true
}

function openTaskEditModal(task: Task) {
	editContext.value = task
	taskFormModalInput.value = task
	showTaskEditModal.value = true
}

function openDeleteModal(task: Task) {
	deleteContext.value = task
	showDeleteModal.value = true
}

function scheduleTask(task: Task) {
	emits('scheduleTask', task)
}

function dismissSchedule() {
	emits('dismissSchedule')
}

</script>

<template>
	<UCard class="flex w-64 h-full" :ui="{ body: 'w-full' }">
		<UiTaskFormModal v-model:open="showTaskCreateModal" :input="taskFormModalInput" action="create"
			@submnitted="addTask" />
		<UiTaskFormModal v-model:open="showTaskEditModal" :input="taskFormModalInput" action="edit"
			@submnitted="editTask" />

		<UModal v-model:open="showDeleteModal" title="Delete Task"
			description="Are you sure you want to Delete this Task">
			<template #footer>
				<UButton color="primary" @click="() => deleteTask()">Delete</UButton>
				<UButton @click="showDeleteModal = false">Cancel</UButton>
			</template>
		</UModal>

		<div class="flex flex-col h-full w-full gap-5" @dragenter="dismissSchedule">
			<header class="flex flex-col gap-2">
				<Title1>Calendar</Title1>
				<UCalendar v-model="selectedDate" />
			</header>
			<div class="flex flex-col grow justify-between overflow-x-hidden">
				<div class="flex flex-col gap-2 h-full overflow-x-hidden">
					<Title1>Tasks</Title1>
					<div class="flex gap-2 grow flex-col overflow-auto px-1 py-2">
						<ListItem v-for="task in todoTasks" :is-scheduled="task.scheduled_at !== undefined">
							<div class="flex w-full gap-4 items-center" @dragstart="scheduleTask(task)"
								draggable="true">
								<span
									class="grow overflow-scroll py-3 overflow-shadow flex flex-row gap-2 items-center">
									<UCheckbox v-model="task.done" @change="() => editTask(task)" />{{ task.title }}
								</span>
								<div class="flex gap-1">
									<UButton size="xs" color="neutral" class="flex justify-center"
										icon="mingcute:pencil-line" @click="() => openTaskEditModal(task)" />
									<UButton size="xs" color="primary" class="flex justify-center"
										icon="octicon:trashcan-16" @click="() => openDeleteModal(task)" />
								</div>
							</div>
						</ListItem>
						<USeparator label="Done" v-if="todoTasks.length !== 0" />
						<ListItem v-for="task in doneTasks" :is-scheduled="task.scheduled_at !== undefined">
							<div class="flex w-full gap-4 items-center" @dragstart="scheduleTask(task)"
								draggable="true">
								<span
									class="grow overflow-scroll py-3 overflow-shadow flex flex-row gap-2 items-center">
									<UCheckbox v-model="task.done" @change="() => editTask(task)" />{{ task.title }}
								</span>
								<div class="flex gap-1">
									<UButton size="xs" color="neutral" class="flex justify-center"
										icon="mingcute:pencil-line" @click="() => openTaskEditModal(task)" />
									<UButton size="xs" color="primary" class="flex justify-center shadow-xl"
										@click="() => openDeleteModal(task)" icon="octicon:trashcan-16" />
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
						<UAvatar :src="user.user.value?.imageUrl" />
						{{ user.user.value?.username }}
					</UButton>
				</UDropdownMenu>
			</footer>
		</div>
	</UCard>
</template>
<style scoped></style>
<style scoped></style>
<style scoped></style>
<style scoped></style>
