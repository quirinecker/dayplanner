<script setup lang="ts">
import Calendar from './calendar/Calendar.vue'
import { Event } from '~/utils/event';
import { UCard } from '#components';
import type { DateTime } from 'luxon';

const events = defineModel<Event[]>('events', { required: true })
const date = defineModel<DateTime>('date', { required: true })
const draggedTask = defineModel<DraggedTask | undefined>('draggedTask', { required: true })
const tasks = defineModel<Task[]>('tasks', { required: true })

const emits = defineEmits<{
	(e: 'createEvent', event: Event): void
	(e: 'edit-task', task: Task): void
	(e: 'edit-event', event: Event): void
	(e: 'delete-event', id: number): void
	(e: 'delete-task', id: number): void
}>()

function deleteItem(event: Event) {
	if (event.task !== undefined) {
		emits('delete-task', event.task.id ?? -1)
	} else {
		emits('delete-event', event.id ?? -1)
	}
}

</script>

<template>
	<UCard class="md:flex grow hidden" :ui="{ body: 'w-full h-full' }">
		<Calendar @create="(event) => emits('createEvent', event)" @edit-task="(task) => emits('edit-task', task)"
			@edit="(event) => emits('edit-event', event)" @delete="deleteItem" v-model:events="events"
			v-model:date="date" , v-model:dragged-task="draggedTask" v-model:tasks="tasks">
		</Calendar>
	</UCard>
</template>

<style scoped></style>
