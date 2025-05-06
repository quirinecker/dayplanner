// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2024-11-01',
	devtools: { enabled: true },
	modules: ['@nuxt/eslint', '@nuxt/test-utils', '@nuxt/ui'],
	app: {
		baseURL: process.env.BASE_URL,
	},
})
