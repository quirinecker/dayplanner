<script setup lang="ts">
import Calendar from './calendar/Calendar.vue'
import { Event } from '~/utils/event';
import { UCard } from '#components';
import type { DateTime } from 'luxon';

const events = defineModel<Event[]>('events', { required: true })
const date = defineModel<DateTime>('date', { required: true })

const emits = defineEmits<{
	(e: 'createEvent', event: Event): void
}>()

</script>

<template>
	<UCard class="flex grow" :ui="{ body: 'w-full h-full' }">
		<Calendar @create="(event) => emits('createEvent', event)"v-model:events="events" v-model:date="date"></Calendar>
	</UCard>
</template>

<style scoped></style>
