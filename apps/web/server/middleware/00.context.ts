export default defineEventHandler(event => {
	event.context.preview = isPreview(event)
})
