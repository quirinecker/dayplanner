<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import CalendarSeperator from './CalendarSeperator.vue';
import CalendarEvent from './CalendarEvent.vue';
import { Event } from '~/utils/event';
import type { DateTime } from 'luxon';
import { UBadge } from '#components';

const props = defineProps<{
	seperators: Seperator[],
	day: DateTime
	events: CollissionWrapper[][]
	date: DateTime
}>()

const emit = defineEmits<{
	(e: 'quick-create', day: DateTime, event: EventDimensions): void,
	(e: 'edit', event: Event): void
	(e: 'moved', event: Event): void
	(e: 'delete', event: Event): void
}>()

const isDragging = ref(false)
const startY = ref(0)
const endY = ref(0)
const column = useTemplateRef('column')
const draggedEvent = defineModel<DraggedEvent | undefined>('draggedEvent')
const draggedTask = defineModel<DraggedTask | undefined>('draggedTask')

const height = computed(() => {
	return Math.abs(endY.value - startY.value)
})

const top = computed(() => {
	return Math.min(startY.value, endY.value)
})

function mousedown(e: MouseEvent) {
	startY.value = absoluteToRelativeY(e.clientY)
	endY.value = absoluteToRelativeY(e.clientY)
	isDragging.value = true
}

function mouseover(e: MouseEvent) {
	if (!isDragging.value) {
		return
	}

	endY.value = absoluteToRelativeY(e.clientY)
}

function absoluteToRelativeY(n: number) {
	return n - (column.value?.getBoundingClientRect().top ?? 0)
}

function mouseup(_: MouseEvent) {
	isDragging.value = false

	if (column.value === null) {
		console.error('column element is undefined')
		return
	}

	const timeFrom = Math.min(endY.value, startY.value) / column.value.offsetHeight
	const timeTo = Math.max(endY.value, startY.value) / column.value.offsetHeight

	if (timeTo * column.value.offsetHeight - timeFrom * column.value.offsetHeight <= 10) {
		startY.value = 0
		endY.value = 0
		return
	}

	emit('quick-create', props.day, {
		from: timeFrom,
		to: timeTo
	})

	startY.value = 0
	endY.value = 0
}

function eventMove(mouseEvent: MouseEvent, event: Event) {
	draggedEvent.value = event.toDraggedEvent(column.value?.offsetHeight ?? 0, absoluteToRelativeY(mouseEvent.clientY))
}

function dragover(e: DragEvent) {
	e.preventDefault()
	drawDraggedEvent(e)
	drawDraggedTask(e)
}

function drawDraggedTask(event: DragEvent) {
	if (draggedTask.value === undefined) {
		return;
	}

	if (draggedTask.value.dragInfo === undefined) {
		draggedTask.value.dragInfo = {
			height: (draggedTask.value.target.estimated_time / 60 / 24) * (column.value?.offsetHeight ?? 0),
			top: absoluteToRelativeY(event.clientY),
			date: props.day
		}
		drawDraggedTask(event)
	}

	draggedTask.value.dragInfo.top = absoluteToRelativeY(event.clientY)
	draggedTask.value.dragInfo.date = props.day
}

function drawDraggedEvent(event: DragEvent) {
	if (draggedEvent.value === undefined) {
		return
	}

	if (!draggedEvent.value.date.equals(props.day)) {
		draggedEvent.value.date = props.day
	}


	draggedEvent.value.top = absoluteToRelativeY(event.clientY) - draggedEvent.value.offset
}

function dragDrop(_: DragEvent) {
	console.log('dropping')
	if (draggedEvent.value !== undefined) {
		updateEventWithDraggedEvent()
	}

	if (draggedTask.value !== undefined) {
		console.log('dropping task')
		updateTaskWithDraggedTask()
	}
}

function updateEventWithDraggedEvent() {
	if (draggedEvent.value == undefined) return

	if (draggedEvent.value.target.task !== undefined) {
		draggedEvent.value.target.task.scheduled_at = draggedEvent.value.date.startOf('day').plus({
			minutes: draggedEvent.value.top / (column.value?.offsetHeight ?? 1) * 24 * 60
		})
	} else {
		draggedEvent.value?.target.updateWithDraggedEvent(draggedEvent.value, column.value?.offsetHeight ?? 0)
	}

	if (draggedEvent.value === undefined) {
		draggedEvent.value = undefined
		return
	}

	emit('moved', draggedEvent.value.target)
	draggedEvent.value = undefined
}

function updateTaskWithDraggedTask() {
	if (draggedTask.value === undefined) {
		return
	}

	if (draggedTask.value.dragInfo === undefined) {
		return
	}

	draggedTask.value.target.scheduled_at = draggedTask.value.dragInfo.date.startOf('day').plus({
		minutes: draggedTask.value.dragInfo.top / (column.value?.offsetHeight ?? 1) * 24 * 60
	})

	draggedTask.value = undefined
}

</script>

<template>
	<div class="flex flex-col h-full grow">
		<div class="flex justify-center items-center flex-col h-18 border-b-1 border-muted">
			<div>{{ props.day.toFormat('ccc').toUpperCase() }}</div>
			<UBadge class="rounded-full" v-if="date.startOf('day').equals(day.startOf('day'))">{{ props.day.day }}
			</UBadge>
			<div v-else>{{ props.day.day }}</div>
		</div>

		<div id="col" ref="column" @mousedown="mousedown" @mouseup="mouseup" @mousemove="mouseover" @dragover="dragover"
			@dragend="dragDrop" @drop="dragDrop" class="relative flex flex-col grow items-center select-none">
			<CalendarSeperator v-for="sep in seperators" :seperator="sep">
				<hr class="w-full border-muted">
			</CalendarSeperator>
			<div class="absolute w-11/12 top-20 bg-black opacity-45 rounded-lg"
				:style="{ height: `${height}px`, top: `${top}px` }"></div>

			<div v-for="[index, column] in events.entries()" class="flex flex-row w-11/12 h-full absolute top-0">
				<CalendarEvent v-for="event in column" :event="event" :columnIndex="index" @move="eventMove"
					@edit="event => emit(`edit`, event)" @delete="event => emit(`delete`, event)" />
			</div>

			<div v-if="draggedEvent !== undefined && draggedEvent.date.equals(props.day)"
				class="absolute w-11/12 top-20 bg-black opacity-45 rounded-lg"
				:style="{ height: `${draggedEvent.height}px`, top: `${draggedEvent.top}px` }"></div>
			<div v-if="draggedTask !== undefined && draggedTask.dragInfo !== undefined && draggedTask.dragInfo.date.equals(props.day)"
				class="absolute w-11/12 top-20 bg-black opacity-45 rounded-lg"
				:style="{ height: `${draggedTask.dragInfo.height}px`, top: `${draggedTask.dragInfo.top}px` }"></div>
		</div>
	</div>
</template>

<style scoped></style>
<style scoped></style>
