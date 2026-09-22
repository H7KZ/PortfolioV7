export default defineEventHandler(event => {
	const filename = decodeURIComponent(getRouterParam(event, 'path') ?? '')
	if (!filename || filename.includes('/') || filename.includes('..')) throw createError({ statusCode: 404, statusMessage: 'Not Found' })
	return proxyMedia(event, filename)
})
