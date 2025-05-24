<script setup lang="ts">
import { UApp } from '#components';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080'
</script>


<template>
	<UApp>
		<NuxtPage />
	</UApp>
</template>
