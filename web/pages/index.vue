<script setup lang="ts">
import axios from 'axios';
import { DateTime } from 'luxon';
import MainContent from '~/components/ui/MainContent.vue';
import Sidebar from '~/components/ui/Sidebar.vue';
import { Event, type SerializableEvent } from '~/utils/event';

const {$socket} = useNuxtApp()

const date = ref<DateTime>(DateTime.now())
const events = ref<Event[]>([])
const tasks = ref<Task[]>([])
const draggedTask = ref<DraggedTask | undefined>(undefined)

const { data: eventsResponse, refresh: refreshEvent } = await useAsyncData<SerializableEvent[]>(
	'events',
	() => axios.get<SerializableEvent[]>('/events').then(res => res.data)
);

const { data: tasksResponse, refresh: refreshTask } = await useAsyncData<SerializableTask[]>(
	'tasks',
	() => axios.get<SerializableTask[]>('/tasks').then(res => res.data)
);

onMounted(() => {
	events.value = eventsResponse.value?.map(Event.fromSerializable) ?? []
	tasks.value = tasksResponse.value?.map(Task.fromSerializable) ?? []
	$socket.on('change', async () => {
		console.log("change socket")
		location.reload()
		//await refreshEvent()
		//await refreshTask()
	})
})

async function postEvent(event: Event) {
	console.log('posting Event')
	await axios.post('/events', event.toSerializable())
	$socket.emit('change')
}

async function postTask(task: Task) {
	console.log('posting Task')
	const createdTask = await axios.post<SerializableTask>('/tasks', task)
	console.log(createdTask)
	task.id = createdTask.data.id
	$socket.emit('change')
}

async function deleteEvent(id: number) {
	console.log('deleting Event')
	await axios.delete(`/events/${id}`)
	await refreshTask()
	$socket.emit('change')
}

async function deleteTask(id: number) {
	console.log('deleting Task')
	await axios.delete(`/tasks/${id}`)
	await refreshTask()
	$socket.emit('change')
}

async function putEvent(event: Event) {
	console.log('editing event')
	await axios.put(`/events/${event.id}`, event)
	await refreshTask()
	$socket.emit('change')
}

async function putTask(task: Task) {
	console.log('editing task')
	await axios.put(`/tasks/${task.id}`, task)
	await refreshTask()
	$socket.emit('change')
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
			v-model:dragged-task="draggedTask" v-model:tasks="tasks" @create-event="postEvent" @edit-task="putTask" @edit-event="putEvent" @delete-event="deleteEvent" @delete-task="deleteTask"/>
	</div>
</template>


<style scoped></style>
