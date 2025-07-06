<script setup lang="ts">
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

const modalTitle = computed(() => {
	return props.action === 'create' ? 'Create Task' : 'Edit Task'
})

const modalDescription = computed(() => {
	return props.action === 'create' ? 'Create task with description, due date and name' : 'Edit description, due date and name'
})

watchEffect(() => {
	titleField.value = props.input.title ?? ''
	descriptionField.value = props.input.description ?? ''
	estimatedTimeField.value = (((props.input.estimated_time) ?? 0) / 60)
	dueDateField.value = props.input.due_date?.toFormat('yyyy-MM-dd') ?? ''
	dueTimeField.value = props.input.due_date?.toFormat('HH:mm') ?? ''
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

</script>

<template>
	<UModal v-model:open="open" :title="modalTitle" :description="modalDescription">
		<template #body>
			<div class="flex flex-col gap-2">
				<UInput type="text" placeholder="Name" v-model="titleField" required />
				<UInput type="number" class="grow" placeholder="estimated time in hours" v-model="estimatedTimeField"
					icon="mdi:stopwatch-outline" required />
				<div class="flex flex-row gap-2">
					<UInput type="date" class="grow" placeholder="due data e.g 2025-06-16" v-model="dueDateField"
						icon="i-lucide-calendar" required />
					<UInput class="grow" placeholder="due time e.g 15:34" v-model="dueTimeField" icon="i-lucide-clock"
						required />
				</div>
				<UTextarea type="text" placeholder="Description" v-model="descriptionField" required />
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
