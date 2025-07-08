<script setup lang="ts">
import { UFormField, UInputMenu } from '#components';
import { DateTime } from 'luxon';
import * as z from 'zod';

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
	(e: 'submnitted', event: Task): void
	(e: 'canceled'): void
}>()

const props = defineProps<{
	action: 'create' | 'edit'
	input: Partial<Task>,
}>()

const toast = useToast()

const titleField = ref('')
const descriptionField = ref('')
const estimatedTimeField = ref(0)
const dueTimeField = ref('')
const dueDateField = ref('')
const scheduledAtDateField = ref('')
const scheduledAtTimeField = ref('')

const modalTitle = computed(() => {
	return props.action === 'create' ? 'Create Task' : 'Edit Task'
})

const modalDescription = computed(() => {
	return props.action === 'create' ? 'Create task with description, due date and name' : 'Edit description, due date and name'
})

const timeSuggestions = ref<string[]>((() => {
	const times = [];

	for (let hour = 0; hour < 24; hour++) {
		for (let minute = 0; minute < 60; minute += 10) {
			const hh = String(hour).padStart(2, '0');
			const mm = String(minute).padStart(2, '0');
			times.push(`${hh}:${mm}`);
		}
	}

	return times;
})())

watchEffect(() => {
	titleField.value = props.input.title ?? ''
	descriptionField.value = props.input.description ?? ''
	estimatedTimeField.value = (((props.input.estimated_time) ?? 0) / 60)
	dueDateField.value = props.input.due_date?.toFormat('yyyy-MM-dd') ?? ''
	dueTimeField.value = props.input.due_date?.toFormat('HH:mm') ?? ''
	scheduledAtDateField.value = props.input.scheduled_at?.toFormat('yyyy-MM-dd') ?? ''
	scheduledAtTimeField.value = props.input.scheduled_at?.toFormat('HH:mm') ?? ''
})

const formSchema = z.object({
	title: z.string().trim().min(1, { message: 'Title is required' }),
	description: z.string().default(''),
	estimated_time: z.number().min(1, { message: 'Estimated time is required and cant be 0' }),
	due_date: z.string().datetime({ message: 'Invalid due date', local: true })
})


function submit() {
	const form = formSchema.safeParse({
		title: titleField.value,
		description: descriptionField.value,
		estimated_time: estimatedTimeField.value * 60,
		due_date: dateStringFromFields(dueDateField.value, dueTimeField.value)
	})

	if (form.error) {
		for (const error of form.error.errors) {
			toast.add({
				title: error.message
			})
		}
		return
	}

	emit('submnitted', Task.fromSimpleTask({
		id: props.input.id,
		title: form.data.title,
		done: props.input.done ?? false,
		description: form.data.description,
		estimated_time: form.data.estimated_time,
		due_date: DateTime.fromISO(form.data.due_date),
		scheduled_at: props.input.scheduled_at
	}))
	open.value = false
}

function dateStringFromFields(date: string, time: string) {
	return `${date}T${time}:00`
}

function cancel() {
	emit('canceled')
	open.value = false
}

const formatOptions: Intl.NumberFormatOptions = {
      signDisplay: 'negative',
      minimumFractionDigits: 1
}

</script>

<template>
	<UModal v-model:open="open" :title="modalTitle" :description="modalDescription">
		<template #body>
			<div class="flex flex-col gap-2">
				<div class="flex flex-row gap-2">
					<UFormField label="Title" class="flex-1/2">
						<UInput type="text" class="w-full" placeholder="Name" v-model="titleField" required />
					</UFormField>
					<UFormField label="Estimated time in hours" class="flex-1/2">
						<UInputNumber class="grow" placeholder="estimated time in hours"
							v-model="estimatedTimeField" icon="mdi:stopwatch-outline" :step-snapping="false" :format-options="formatOptions" :min="0" required />
					</UFormField>
				</div>
				<UFormField label="Deadline" :ui="{ container: 'flex flex-row gap-2' }">
					<UInput type="date" class="flex-1/2" placeholder="due data e.g 2025-06-16" v-model="dueDateField"
						icon="i-lucide-calendar" required />
					<UInput class="flex-1/2" placeholder="due time e.g 15:34" v-model="dueTimeField"
						icon="i-lucide-clock" :create-item="true" required />
				</UFormField>
				<UFormField label="Scheduled at" :ui="{ container: 'flex flex-row gap-2' }"
					v-if="props.input.scheduled_at">
					<UInput type="date" class="flex-1/2" placeholder="schedule data e.g 2025-06-16"
						v-model="scheduledAtDateField" icon="i-lucide-calendar" required />
					<UInput class="flex-1/2" placeholder="schedule time e.g 15:34" v-model="scheduledAtTimeField"
						icon="i-lucide-clock" :create-item="true" required/>
				</UFormField>
				<UFormField label="Description">
					<UTextarea type="text" class="w-full" placeholder="Description" v-model="descriptionField"
						required />
				</UFormField>
			</div>
		</template>
		<template #footer>
			<UButton variant="solid" @click="submit">
				{{ action === 'create' ? 'Create' : 'Edit' }}
			</UButton>
			<UButton variant="soft" @click="cancel">
				Cancel
			</UButton>
		</template>
	</UModal>
</template>

<style scoped></style>
