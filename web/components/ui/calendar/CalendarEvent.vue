<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Event } from '~/utils/event';

const props = defineProps<{
	event: CollissionWrapper
	columnIndex: number
}>()

const emit = defineEmits<{
	(e: 'move', mouseEvent: MouseEvent, event: Event): void,
	(e: 'edit', event: Event): void
	(e: 'delete', event: Event): void
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
	<UPopover :content="{ side: 'right' }" arrow>
		<div class="absolute rounded-lg h-0 top-20 bg-black opacity-45 p-2 flex flex-col z-10" @mousedown.stop
			@mouseover.stop @mouseup.stop draggable="true" @dragstart="dragStart"
			:style="{ top: `${top}%`, height: `${height}%`, left: `${left}%`, width: `${widht}%` }">
			<div>{{ event.event.from.toFormat('HH:mm') }} - {{ event.event.to.toFormat('HH:mm') }}</div>
			<div>{{ event.event.title }}</div>
		</div>
		<template #content>
			<UCard class="w-xl">
				<template #header>
					<div class="flex flex-row justify-between items-center">
						<h1>{{ event.event.title }}</h1>
						<nav class="flex flex-row gap-2">
							<UButton icon="i-lucide-pencil" @click="emit('edit', event.event)"></UButton>
							<UButton icon="i-lucide-trash" @click="emit('delete', event.event)"></UButton>
						</nav>
					</div>
				</template>
				<template #default>
					<div>{{ event.event.from.toFormat('HH:mm') }} - {{ event.event.to.toFormat('HH:mm') }}</div>
					<div class="overflow-scroll pb-5 overflow-shadow">
						{{ event.event.description }}
					</div>
				</template>
			</UCard>
		</template>
	</UPopover>
</template>
