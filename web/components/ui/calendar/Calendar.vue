<script setup lang="ts">
import { computed, ref } from 'vue';
import CalendarHeader from './CalendarHeader.vue';
import CalendarCollumn from './CalendarCollumn.vue';
import { Event } from '~/utils/event';
import { DateTime } from 'luxon';

const events = defineModel<Event[]>('events', { required: true })
const date = defineModel<DateTime>('date', { required: true })
const draggedEvent = ref<DraggedEvent | undefined>()

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


function quickCreate(date: DateTime, timespan: Timespan) {
	const eventTitle = prompt("Event title")

	if (eventTitle === null) {
		return
	}

	const newEvent: Event = new Event(
		eventTitle,
		date.startOf('day').plus({ minutes: timespan.from * 24 * 60 }),
		date.startOf('day').plus({ minutes: timespan.to * 24 * 60 })
	)

	emits('create', newEvent)
	events.value.push(newEvent)
}

</script>

<template>
	<div class="w-full h-full flex flex-col">
		<div class="calendar flex flex-row w-full flex-1 items-stretch divide-x divide-muted">
			<CalendarHeader :seperators="seperators" />

			<CalendarCollumn v-for="day in days" :seperators="seperators" :day="day.date" :events="day.events"
				:date="date" v-model:draggedEvent="draggedEvent" @quick-create="quickCreate" />
		</div>

	</div>
</template>
