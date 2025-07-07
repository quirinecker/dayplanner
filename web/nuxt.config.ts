// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2024-11-01',
	devtools: { enabled: true },
	css: ['~/assets/css/main.css'],
	modules: [
		'@nuxt/eslint',
		'@nuxt/test-utils',
		'@nuxt/ui',
		'@nuxtjs/color-mode', '@clerk/nuxt'
	],
	app: {
		baseURL: process.env.BASE_URL,
	}
})
