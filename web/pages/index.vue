<script setup lang="ts">
import axios from 'axios';
import { DateTime } from 'luxon';
import MainContent from '~/components/ui/MainContent.vue';
import Sidebar from '~/components/ui/Sidebar.vue';
import { Event, type SerializableEvent } from '~/utils/event';

const { $socket } = useNuxtApp()
const auth = useAuth()

const date = ref<DateTime>(DateTime.now())
const events = ref<Event[]>([])
const tasks = ref<Task[]>([])
const draggedTask = ref<DraggedTask | undefined>(undefined)

async function fetchData<T>(path: string) {
	const requestHeaders = useRequestHeaders(["cookie"]);
	if (import.meta.client) {
		return axios.get<T[]>(path, await getAuthHeader()).then(res => res.data)
	} else {
		return axios.get<T[]>(path, {
			headers: requestHeaders,
		}).then(res => res.data);
	}
}

const { data: eventsResponse, refresh: refreshEvent } = await useAsyncData<SerializableEvent[]>(
	'events',
	() => fetchData('/events')
);

const { data: tasksResponse, refresh: refreshTask } = await useAsyncData<SerializableTask[]>(
	'tasks',
	() => fetchData('/tasks')
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

async function getAuthHeader() {
	return {
		'headers': {
			'Authorization': `Bearer ${await auth.getToken.value()}`
		}
	}
}

async function postEvent(event: Event) {
	console.log('posting Event')
	await axios.post('/events', event.toSerializable(), await getAuthHeader())
	$socket.emit('change')
}

async function postTask(task: Task) {
	console.log('posting Task')
	const createdTask = await axios.post<SerializableTask>('/tasks', task, await getAuthHeader())
	console.log(createdTask)
	task.id = createdTask.data.id
	$socket.emit('change')
}

async function deleteEvent(id: number) {
	console.log('deleting Event')
	await axios.delete(`/events/${id}`, await getAuthHeader())
	await refreshTask()
	$socket.emit('change')
}

async function deleteTask(id: number) {
	console.log('deleting Task')
	await axios.delete(`/tasks/${id}`, await getAuthHeader())
	await refreshTask()
	$socket.emit('change')
}

async function putEvent(event: Event) {
	console.log('editing event')
	await axios.put(`/events/${event.id}`, event, await getAuthHeader())
	await refreshTask()
	$socket.emit('change')
}

async function putTask(task: Task) {
	console.log('editing task')
	console.log(task.scheduled_at)
	await axios.put(
		`/tasks/${task.id}`,
		{...task, scheduled_at: task.scheduled_at ?? null},
		await getAuthHeader()
	)
	await refreshTask()
	$socket.emit('change')
}

function scheduleTask(task: Task) {
	draggedTask.value = { target: task, dragInfo: undefined, active: false }
}

function dismissSchedule() {
	console.log(draggedTask.value?.active)
	if (draggedTask.value !== undefined && draggedTask.value.active) {
		draggedTask.value.active = false
	}
}

</script>

<template>
	<div class="h-screen w-screen p-4 flex flex-row gap-5">
		<Sidebar v-if="tasks !== null" v-model:tasks="tasks" v-model:date="date" @create-task="postTask"
			@delete-task="deleteTask" @schedule-task="scheduleTask" @edit-task="putTask"
			@dismiss-schedule="dismissSchedule" />
		<MainContent v-if="events !== null" v-model:events="events" v-model:date="date"
			v-model:dragged-task="draggedTask" v-model:tasks="tasks" @create-event="postEvent" @edit-task="putTask"
			@edit-event="putEvent" @delete-event="deleteEvent" @delete-task="deleteTask" />
	</div>
</template>


<style scoped></style>
