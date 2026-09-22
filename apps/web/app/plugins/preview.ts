export default defineNuxtPlugin(() => {
	useState('preview', () => Boolean(useRequestEvent()?.context.preview))
})
