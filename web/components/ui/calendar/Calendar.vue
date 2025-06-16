<script setup lang="ts">
import { computed, ref } from 'vue';
import CalendarHeader from './CalendarHeader.vue';
import CalendarCollumn from './CalendarCollumn.vue';
import { Event } from '~/utils/event';
import { DateTime } from 'luxon';
import { UTextarea } from '#components';

const events = defineModel<Event[]>('events', { required: true })
const date = defineModel<DateTime>('date', { required: true })
const draggedEvent = ref<DraggedEvent | undefined>()
const createModalOpened = ref(false)
const createContext = ref<{ date: DateTime, timespan: Timespan } | undefined>(undefined)
const createModal = {
	open: ref(false),
	fromTimeField: ref<string>(''),
	toTimeField: ref<string>(''),
	toDateField: ref<string>(''),
	fromDateField: ref<string>(''),
	nameField: ref<string>(''),
	descriptionField: ref<string>(''),
	clear: () => {
		createModal.nameField.value = ''
		createModal.fromDateField.value = ''
		createModal.toDateField.value = ''
		createModal.fromTimeField.value = ''
		createModal.toTimeField.value = ''
		createModal.descriptionField.value = ''
	}
}

const toast = useToast()

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

const days = computed<Day[]>(() => {
	return [1, 2, 3, 4, 5, 6, 7].map((i) => {
		const currentDate = date.value.startOf('week').plus({ day: i - 1 })
		const filteredEvents = events.value.filter(
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

const emits = defineEmits<{
	(e: 'create', event: Event): void
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
	createContext.value = {
		date: date,
		timespan: timespan
	}

	const from = date.startOf('day').plus({ minutes: timespan.from * 24 * 60 })
	const to = date.startOf('day').plus({ minutes: timespan.to * 24 * 60 })

	createModal.fromDateField.value = from.toISODate() ?? ''
	createModal.toDateField.value = to.toISODate() ?? ''
	createModal.fromTimeField.value = from.toFormat('HH:mm')
	createModal.toTimeField.value = to.toFormat('HH:mm')
	createModal.open.value = true
}

function create() {
	const from = dateFromFields(createModal.fromDateField.value, createModal.fromTimeField.value)
	const to = dateFromFields(createModal.toDateField.value, createModal.toTimeField.value)

	if (!from.isValid) {
		toast.add({
			title: 'Invalid `from` date format'
		})
	}

	if (!to.isValid) {
		toast.add({
			title: 'Invalid `to` date format'
		})
	}

	if (createModal.nameField.value.trim() === '') {
		toast.add({
			title: 'Name is required'
		})
	}

	const event = new Event(createModal.nameField.value, from, to, createModal.descriptionField.value)
	emits('create', event)
	createModal.clear()
	createModal.open.value = false
	events.value.push(event)
}

function dateFromFields(date: string, time: string) {
	return DateTime.fromFormat(`${date} ${time}`, 'yyyy-MM-dd HH:mm')
}

</script>

<template>
	<div class="w-full h-full flex flex-col">
		<UModal v-model:open="createModal.open.value" title="Create Event"
			description="Set name and change time of event before creation">
			<template #body>
				<div class="flex flex-col gap-2">
					<UInput type="text" placeholder="Name" v-model="createModal.nameField.value" required />
					<div class="flex flex-row gap-2">
						<UInput class="grow" placeholder="2025-06-16" v-model="createModal.fromDateField.value"
							icon="i-lucide-calendar" required />
						<UInput class="grow" placeholder="15:34" v-model="createModal.fromTimeField.value"
							icon="i-lucide-clock" required />
					</div>
					<div class="flex flex-row gap-2">
						<UInput class="grow" placeholder="2025-06-16" v-model="createModal.toDateField.value"
							icon="i-lucide-calendar" required />
						<UInput class="grow" placeholder="15:34" v-model="createModal.toTimeField.value"
							icon="i-lucide-clock" required />
					</div>
					<UTextarea type="text" placeholder="Description" v-model="createModal.descriptionField.value"
						required />
				</div>
			</template>
			<template #footer>
				<UButton variant="solid" @click="create">
					Create
				</UButton>
				<UButton variant="soft">
					Cancel
				</UButton>
			</template>
		</UModal>
		<div class="calendar flex flex-row w-full flex-1 items-stretch divide-x divide-muted">
			<CalendarHeader :seperators="seperators" />

			<CalendarCollumn v-for="day in days" :seperators="seperators" :day="day.date" :events="day.events"
				:date="date" v-model:draggedEvent="draggedEvent" @quick-create="openCreateModal" />
		</div>

	</div>
</template>
