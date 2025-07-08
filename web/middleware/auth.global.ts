export default defineNuxtRouteMiddleware((to, _) => {
	const auth = useAuth()

	if (to.path === '/login') {
		return
	}

	if (auth.userId.value === null) {
		return navigateTo('/login')
	} else if (to.path !== '/') {
		return navigateTo('/')
	}
})
