<script setup lang="ts">
defineProps<{
	isScheduled: boolean
}>()

</script>

<template>
	<UCard class="[&>*]:p-3 w-full" :variant="isScheduled ? 'subtle' : 'outline'">
		<slot />
	</UCard>
</template>

<style scoped></style>
