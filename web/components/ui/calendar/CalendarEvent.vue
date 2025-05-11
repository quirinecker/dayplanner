<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
	event: CollissionWrapper
	columnIndex: number
}>()

const emit = defineEmits<{
	(e: 'move', mouseEvent: MouseEvent, event: Event): void,
}>()

const visible = ref(true)

const dimensions = computed<EventDimensions>(() => {
	return props.event.event.getPercentDimensions()
})

const left = computed(() => {
	return (100 / (props.event.collisions + 1)) * props.columnIndex
})

const widht = computed(() => {
	return (100 / (props.event.collisions + 1))
})

const height = computed(() => {
	return Math.abs(dimensions.value.from - dimensions.value.to)
})

const top = computed(() => {
	return Math.min(dimensions.value.from, dimensions.value.to)
})

function dragStart(e: DragEvent) {
	console.log("start drag")
	emit('move', e, props.event.event)
	visible.value = false
}

</script>

<template>
	<div class="absolute rounded-lg h-0 top-20 bg-black opacity-45 p-2 flex flex-col z-10" @mousedown.stop
		@mouseover.stop @mouseup.stop draggable="true" @dragstart="dragStart"
		:style="{ top: `${top}%`, height: `${height}%`, left: `${left}%`, width: `${widht}%` }">
		<div>{{ event.event.from.format('HH:mm') }} - {{ event.event.to.format('HH:mm') }}</div>
		<div>{{ event.event.title }}</div>
	</div>
</template>
