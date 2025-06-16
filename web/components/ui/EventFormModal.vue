<script setup lang="ts">
import { type SimpleEvent } from '#imports';
import { DateTime } from 'luxon';
import * as z from 'zod';

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
	(e: 'submnitted', event: SimpleEvent): void
	(e: 'canceled'): void
}>()

const props = defineProps<{
	action: 'create' | 'edit'
	input: Partial<SimpleEvent>,
}>()

const toast = useToast()

const titleField = ref('')
const descriptionField = ref('')
const fromTimeField = ref('')
const fromDateField = ref('')
const toTimeField = ref('')
const toDateField = ref('')

const modalTitle = computed(() => {
	return props.action === 'create' ? 'Create Event' : 'Edit Event'
})

const modalDescription = computed(() => {
	return props.action === 'create' ? 'Create event and set name, description and time' : 'Edit name, description and time'
})

watchEffect(() => {
	titleField.value = props.input.title ?? ''
	descriptionField.value = props.input.description ?? ''
	fromTimeField.value = props.input.from?.toFormat('HH:mm') ?? ''
	fromDateField.value = props.input.from?.toFormat('yyyy-MM-dd') ?? ''
	toTimeField.value = props.input.to?.toFormat('HH:mm') ?? ''
	toDateField.value = props.input.to?.toFormat('yyyy-MM-dd') ?? ''
})

const formSchema = z.object({
	title: z.string().trim().min(1, { message: 'Title is required' }),
	description: z.string().default(''),
	from: z.string().datetime({ message: 'Invalid start date', local: true }),
	to: z.string().datetime({ message: 'Invalid end date', local: true })
})


function submit() {
	console.log({
		from: dateStringFromFields(fromDateField.value, fromTimeField.value),
		to: dateStringFromFields(toDateField.value, toTimeField.value)
	})
	const form = formSchema.safeParse({
		title: titleField.value,
		description: descriptionField.value,
		from: dateStringFromFields(fromDateField.value, fromTimeField.value),
		to: dateStringFromFields(toDateField.value, toTimeField.value)
	})

	if (form.error) {
		for (const error of form.error.errors) {
			toast.add({
				title: error.message
			})
		}
		return
	}

	emit('submnitted', {
		id: props.input.id,
		title: form.data.title,
		description: form.data.description,
		from: DateTime.fromISO(form.data.from),
		to: DateTime.fromISO(form.data.to)
	})
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
				<div class="flex flex-row gap-2">
					<UInput class="grow" placeholder="2025-06-16" v-model="fromDateField" icon="i-lucide-calendar"
						required />
					<UInput class="grow" placeholder="15:34" v-model="fromTimeField" icon="i-lucide-clock" required />
				</div>
				<div class="flex flex-row gap-2">
					<UInput class="grow" placeholder="2025-06-16" v-model="toDateField" icon="i-lucide-calendar"
						required />
					<UInput class="grow" placeholder="15:34" v-model="toTimeField" icon="i-lucide-clock" required />
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
