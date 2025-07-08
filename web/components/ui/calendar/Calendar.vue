<script setup lang="ts">
import { computed, ref } from 'vue';
import CalendarHeader from './CalendarHeader.vue';
import CalendarCollumn from './CalendarCollumn.vue';
import { Event, type SimpleEvent } from '~/utils/event';
import { DateTime } from 'luxon';
import EventFormModal from '../EventFormModal.vue';

const events = defineModel<Event[]>('events', { required: true })
const tasks = defineModel<Task[]>('tasks', { required: true })
const date = defineModel<DateTime>('date', { required: true })
const draggedTask = defineModel<DraggedTask | undefined>('draggedTask', { required: true })
const draggedEvent = ref<DraggedEvent | undefined>()
const createInput = ref<Partial<SimpleEvent>>({})
const editInput = ref<Partial<SimpleEvent>>({})
const editContext = ref<{ event: Event }>()
const createModalOpened = ref(false)
const editModalOpened = ref(false)
const deleteModalOpened = ref(false)
const editTaskModalOpened = ref(false)
const editTaskContext = ref<Task>()
const taskFormModalInput = ref<Partial<Task>>({})
const deleteContext = ref<{ event: Event }>()
const taskDraggingActive = ref(true)

type Day = {
	date: DateTime
	events: CollissionWrapper[][]
}

const week = computed(() => {
	return date.value.startOf('week')
})

function pushEventWithCollisionUpdate(array: CollissionWrapper[], event: Event, collisions: CollissionWrapper[], collisionCount: number) {
	array.push({ event: event, collisions: collisionCount })

	for (let collision of collisions) {
		collision.collisions = collisionCount
	}
}

const taskEvents = computed<Event[]>(() => {
	return tasks.value
		.filter(task => task.isScheduled())
		.map(task => task.toEvent())
})

const days = computed<Day[]>(() => {
	return [1, 2, 3, 4, 5, 6, 7].map((i) => {
		const eventsToDisplay = [...taskEvents.value, ...events.value]
		const currentDate = date.value.startOf('week').plus({ day: i - 1 })
		const filteredEvents = eventsToDisplay.filter(
			(event) => event.from >= currentDate.startOf('day') && event.to <= currentDate.endOf('day')
		)

		const sortedEvents = filteredEvents.sort((a, b) => a.from.valueOf() - b.from.valueOf())

		const columns: CollissionWrapper[][] = [[]]

		for (let event of sortedEvents) {
			let collisions: CollissionWrapper[] = []
			for (let i = 0; i < columns.length; i++) {
				const column = columns[i]
				if (column.length === 0) {
					pushEventWithCollisionUpdate(column, event, collisions, collisions.length)
					break
				}

				if (event.from.valueOf() > column[column.length - 1].event.to.valueOf()) {
					pushEventWithCollisionUpdate(column, event, collisions, collisions.length)
					break
				} else {
					collisions.push(column[column.length - 1])
				}

				if (columns.length === i + 1) {
					columns.push([])
					pushEventWithCollisionUpdate(columns[i + 1], event, collisions, collisions.length)
					break
				}

			}
		}

		return {
			date: currentDate,
			events: columns
		}
	})
})

const deleteTitle = computed(() => {
	if (deleteContext.value === undefined || deleteContext.value.event.task === undefined) {
		return 'Delete Event'
	} else {
		return 'Delete Task'
	}
})

const deleteDescription = computed(() => {
	if (deleteContext.value === undefined || deleteContext.value.event.task === undefined) {
		return 'Are you sure you want to delete this event?'
	} else {
		return 'Are you sure you want to delete this task?'
	}
})

const emits = defineEmits<{
	(e: 'create', event: Event): void
	(e: 'edit', event: Event): void
	(e: 'delete', event: Event): void
	(e: 'edit-task', task: Task): void
}>()

const hour = (num: number) => {
	return DateTime.now().startOf('day').plus({ hours: num })
}

const seperators = ref<Seperator[]>([
	{ text: '3 AM', time: hour(3) },
	{ text: '6 AM', time: hour(6) },
	{ text: '9 AM', time: hour(9) },
	{ text: '12 PM', time: hour(12) },
	{ text: '3 PM', time: hour(15) },
	{ text: '6 PM', time: hour(18) },
	{ text: '9 PM', time: hour(21) },
])

function openCreateModal(date: DateTime, timespan: Timespan) {
	createInput.value = {
		from: date.startOf('day').plus({ minutes: timespan.from * 24 * 60 }),
		to: date.startOf('day').plus({ minutes: timespan.to * 24 * 60 }),
	}

	createModalOpened.value = true
}

function create(simple: SimpleEvent) {
	const event = Event.fromSimple(simple)
	events.value.push(event)
	emits('create', event)
}

function openEditModal(event: Event) {
	if (event.task !== undefined) {
		taskFormModalInput.value = event.task
		editTaskContext.value = event.task
		editTaskModalOpened.value = true
	} else {
		editInput.value = event.toSimple()
		editContext.value = { event: event }
		editModalOpened.value = true
	}
}

function edit(simple: SimpleEvent) {
	editContext.value?.event.updateWithSimple(simple)
	if (editContext.value === undefined) return
	emits('edit', editContext.value.event)
}

function editTask(task: Task) {
	editTaskModalOpened.value = false
	editTaskContext.value?.updateWithOtherTask(task)
	emits('edit-task', task)
}

function openDeleteModal(event: Event) {
	deleteContext.value = { event: event }
	deleteModalOpened.value = true
}

function deleteItem() {
	if (deleteContext.value === undefined) return
	if (deleteContext.value.event.task !== undefined) {
		deleteTask()
	} else {
		deleteEvent()
	}
}

function deleteEvent() {
	if (deleteContext.value === undefined) return
	emits('delete', deleteContext.value?.event)
	console.log(events.value)
	events.value = events.value.filter(e => {
		if (e.id === undefined || deleteContext.value?.event.id === undefined) {
			return true
		}

		if (e.id === deleteContext.value?.event.id) {
			return false
		}

		return true
	})

	deleteModalOpened.value = false
}

function deleteTask() {
	if (deleteContext.value === undefined || deleteContext.value.event.task === undefined) return
	emits('delete', deleteContext.value.event)
	tasks.value = tasks.value.filter(t => t.id !== (deleteContext.value?.event.task?.id ?? -1))
	deleteContext.value = undefined
	deleteModalOpened.value = false
}

function moveEvent(event: Event) {
	if (event.task !== undefined) {
		emits('edit-task', event.task)
	} else emits('edit', event)
}

function dragEnter(_: DragEvent) {
	if (draggedTask.value !== undefined) {
		draggedTask.value.active = true
	}
}

function rawEdit(event: Event) {
	if (event.task === undefined) {
		return
	}

	emits('edit-task', event.task)
}

</script>

<template>
	<div class="w-full h-full flex flex-col" @dragenter="dragEnter">
		<EventFormModal action="create" @submnitted="event => create(event)" :input="createInput"
			v-model:open="createModalOpened" />
		<EventFormModal action="edit" @submnitted="event => edit(event)" :input="editInput"
			v-model:open="editModalOpened" />

		<UiTaskFormModal v-model:open="editTaskModalOpened" :input="taskFormModalInput" action="edit"
			@submnitted="editTask" />

		<UModal v-model:open="deleteModalOpened" :title="deleteTitle" :description="deleteDescription">
			<template #footer>
				<UButton variant="solid" @click="deleteItem">
					Delete
				</UButton>
				<UButton variant="solid" @click="deleteModalOpened = false">
					Cancel
				</UButton>
			</template>
		</UModal>

		<div class="calendar flex flex-row w-full flex-1 items-stretch divide-x divide-muted">
			<CalendarHeader :seperators="seperators" />

			<CalendarCollumn v-for="day in days" :seperators="seperators" :day="day.date" :events="day.events"
				:task-dragging-active="taskDraggingActive" :date="date" v-model:draggedEvent="draggedEvent"
				@quick-create="openCreateModal" @edit="openEditModal" @delete="openDeleteModal" @moved="moveEvent"
				@edit-task="(task) => emits('edit-task', task)" @raw-edit="(event) => rawEdit(event)"
				v-model:dragged-task="draggedTask" />
		</div>

	</div>
</template>
