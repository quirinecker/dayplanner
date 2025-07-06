<script setup lang="ts">
import axios from 'axios';
import { DateTime } from 'luxon';
import MainContent from '~/components/ui/MainContent.vue';
import Sidebar from '~/components/ui/Sidebar.vue';
import { Event, type SerializableEvent } from '~/utils/event';

const date = ref<DateTime>(DateTime.now())
const events = ref<Event[]>([])
const tasks = ref<Task[]>([])
const draggedTask = ref<DraggedTask | undefined>(undefined)

const { data: eventsResponse } = await useAsyncData<SerializableEvent[]>(
	'events',
	() => axios.get<SerializableEvent[]>('/events').then(res => res.data)
);

const { data: tasksResponse, refresh } = await useAsyncData<SerializableTask[]>(
	'tasks',
	() => axios.get<SerializableTask[]>('/tasks').then(res => res.data)
);

onMounted(() => {
	events.value = eventsResponse.value?.map(Event.fromSerializable) ?? []
	tasks.value = tasksResponse.value?.map(Task.fromSerializable) ?? []
})

async function postEvent(event: Event) {
	console.log('posting Event')
	await axios.post('/events', event.toSerializable())
}

async function postTask(task: Task) {
	console.log('posting Task')
	const createdTask = await axios.post<SerializableTask>('/tasks', task)
	console.log(createdTask)
	task.id = createdTask.data.id
}

async function deleteEvent(id: number) {
	console.log('deleting Event')
	await axios.delete(`/events/${id}`)
	await refresh()
}

async function deleteTask(id: number) {
	console.log('deleting Task')
	await axios.delete(`/tasks/${id}`)
	await refresh()
}

async function putEvent(event: Event) {
	console.log('editing event')
	await axios.put(`/events/${event.id}`, event)
	await refresh()
}

async function putTask(task: Task) {
	console.log('editing task')
	await axios.put(`/tasks/${task.id}`, task)
	await refresh()
}

function scheduleTask(task: Task) {
	draggedTask.value = { target: task, dragInfo: undefined }
}

</script>

<template>
	<div class="h-screen w-screen p-4 flex flex-row gap-5">
		<Sidebar v-if="tasks !== null" v-model:tasks="tasks" v-model:date="date" @create-task="postTask"
			@delete-task="deleteTask" @schedule-task="scheduleTask" @edit-task="putTask"/>
		<MainContent v-if="events !== null" v-model:events="events" v-model:date="date"
			v-model:dragged-task="draggedTask" v-model:tasks="tasks" @create-event="postEvent" @edit-task="putTask" @edit-event="putEvent" @delete-event="deleteEvent"/>
	</div>
</template>


<style scoped></style>
