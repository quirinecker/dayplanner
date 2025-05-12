<script setup lang="ts">
import type { DateTime } from 'luxon';

defineProps<{
	seperator: Seperator
}>();

const relativePositionOf = function (time: DateTime) {
	return `${((time.hour) / 24) * 100}%`
}

</script>

<template>
	<div :style="{ top: relativePositionOf(seperator.time) }"
		class="h-10 w-full flex justify-center items-center border-white absolute -translate-y-1/2">
		<slot />
	</div>
</template>

<style scoped></style>
