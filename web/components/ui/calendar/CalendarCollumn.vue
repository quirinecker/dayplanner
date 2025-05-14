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
}>()

const isDragging = ref(false)
const startY = ref(0)
const endY = ref(0)
const column = useTemplateRef('column')
const draggedEvent = defineModel<DraggedEvent | undefined>('draggedEvent')

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
	if (draggedEvent.value === undefined) {
		return
	}

	if (!draggedEvent.value.date.equals(props.day)) {
		draggedEvent.value.date = props.day
	}


	draggedEvent.value.top = absoluteToRelativeY(e.clientY) - draggedEvent.value.offset
}

function dragDrop(_: DragEvent) {
	draggedEvent.value?.target.updateWithDraggedEvent(draggedEvent.value, column.value?.offsetHeight ?? 0)
	draggedEvent.value = undefined
}

</script>

<template>
	<div class="flex flex-col h-full grow">
		<div class="flex justify-center items-center flex-col h-18 border-b-1 border-muted">
			<div>{{ props.day.toFormat('ccc').toUpperCase() }}</div>
			<UBadge class="rounded-full" v-if="date.startOf('day').equals(day.startOf('day'))">{{ props.day.day }}</UBadge>
			<div v-else>{{ props.day.day }}</div>
		</div>

		<div id="col" ref="column" @mousedown="mousedown" @mouseup="mouseup" @mousemove="mouseover" @dragover="dragover"
			@dragend="dragDrop" class="relative flex flex-col grow items-center select-none">
			<CalendarSeperator v-for="sep in seperators" :seperator="sep">
				<hr class="w-full border-muted">
			</CalendarSeperator>
			<div class="absolute w-11/12 top-20 bg-black opacity-45 rounded-lg"
				:style="{ height: `${height}px`, top: `${top}px` }"></div>

			<div v-for="[index, column] in events.entries()" class="flex flex-row w-11/12 h-full absolute top-0">
				<CalendarEvent v-for="event in column" :event="event" :columnIndex="index" @move="eventMove" />
			</div>

			<div v-if="draggedEvent !== undefined && draggedEvent.date.equals(props.day)"
				class="absolute w-11/12 top-20 bg-black opacity-45 rounded-lg"
				:style="{ height: `${draggedEvent.height}px`, top: `${draggedEvent.top}px` }"></div>
		</div>
	</div>
</template>


<style scoped></style>
