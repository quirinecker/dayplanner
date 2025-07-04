<script setup lang="ts">
import axios from 'axios';
import { DateTime } from 'luxon';
import MainContent from '~/components/ui/MainContent.vue';
import Sidebar from '~/components/ui/Sidebar.vue';
import { Event, type SerializableEvent } from '~/utils/event';

const date = ref<DateTime>(DateTime.now())
const events = ref<Event[]>([])

const { data: eventsResponse } = await useAsyncData<SerializableEvent[]>(
	'events',
	() => axios.get<SerializableEvent[]>('/events').then(res => res.data)
);

const {data: tasksResponse, refresh} = await useAsyncData<SerializableTask[]>(
	'tasks',
	() => axios.get<SerializableTask[]>('/tasks').then(res => res.data)
);

onMounted(() => {
	events.value = eventsResponse.value?.map(Event.fromSerializable) ?? []
})

const tasks = computed(() => {
	return tasksResponse.value?.map(Task.fromSerializable) ?? []
})

async function postEvent(event: Event) {
	console.log('posting Event')
	await axios.post('/event', event.toSerializable())
}

async function postTask(name: string) {
	console.log('posting Task')
	await axios.post('/task', {
		title: name,
		description: "",
		done: false,
		estimated_time: 0,
		due_date: (new Date()).toISOString(),
	})
	await refresh()
}

async function deleteTask(id: number) {
	console.log('deleting Task')
	await axios.delete(`/task/${id}`)
	await refresh()
}

</script>

<template>
	<div class="h-screen w-screen p-4 flex flex-row gap-5">
		<Sidebar v-if="tasks !== null" v-model:tasks="tasks" v-model:date="date" @create-task="postTask"
			@delete-task="deleteTask" />
		<MainContent v-if="events !== null" v-model:events="events" v-model:date="date" @create-event="postEvent" />
	</div>
</template>


<style scoped></style>
