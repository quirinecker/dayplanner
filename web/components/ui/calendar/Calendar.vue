<script setup lang="ts">
import { computed, ref } from 'vue';
import CalendarHeader from './CalendarHeader.vue';
import CalendarCollumn from './CalendarCollumn.vue';
import moment, { type Moment } from 'moment';
import { Event } from '~/utils/event';

const events = defineModel<Event[]>('events', { required: true })
const date = defineModel<Moment>('date', { required: true })
const draggedEvent = ref<DraggedEvent | undefined>()

type Day = {
	date: Moment
	events: CollissionWrapper[][]
}

const week = computed(() => {
	return moment(date.value).startOf('isoWeek')
})

function pushEventWithCollisionUpdate(array: CollissionWrapper[], event: Event, collisions: CollissionWrapper[], collisionCount: number) {
	array.push({ event: event, collisions: collisionCount })

	for (let collision of collisions) {
		collision.collisions = collisionCount
	}
}

const days = computed<Day[]>(() => {
	return [1, 2, 3, 4, 5, 6, 7].map((i) => {
		const filteredEvents = events.value.filter(
			(event) => event.from >= moment(week.value).weekday(i).startOf('day') && event.to <= moment(week.value).weekday(i).endOf('day')
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
			date: moment(week.value).weekday(i),
			events: columns
		}
	})
})

const emits = defineEmits<{
	(e: 'create', timespan: Event): void
}>()

const seperators = ref<Seperator[]>([
	{ text: '3 AM', time: moment().hour(3) },
	{ text: '6 AM', time: moment().hour(6) },
	{ text: '9 AM', time: moment().hour(9) },
	{ text: '12 PM', time: moment().hour(12) },
	{ text: '3 PM', time: moment().hour(15) },
	{ text: '6 PM', time: moment().hour(18) },
	{ text: '9 PM', time: moment().hour(21) },
])

function quickCreate(date: Moment, timespan: Timespan) {
	const eventTitle = prompt("Event title")

	if (eventTitle === null) {
		return
	}

	const newEvent: Event = new Event(
		eventTitle,
		moment(date).startOf('day').minutes(timespan.from * 24 * 60),
		moment(date).startOf('day').minutes(timespan.to * 24 * 60)
	)

	emits('create', newEvent)
	events.value.push(newEvent)
}

</script>

<template>
	<div class="w-full h-full flex flex-col">
		<div class="calendar flex flex-row w-full flex-1 items-stretch">
			<CalendarHeader :seperators="seperators" />

			<CalendarCollumn v-for="day in days" :seperators="seperators" :day="day.date" :events="day.events"
				v-model:draggedEvent="draggedEvent" @quick-create="quickCreate" />
		</div>

	</div>
</template>
