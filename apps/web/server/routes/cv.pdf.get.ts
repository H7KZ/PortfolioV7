export default defineEventHandler(async event => {
	const filename = await content().cv()
	if (!filename) throw createError({ statusCode: 404, statusMessage: 'Not Found' })
	return proxyMedia(event, filename, 'inline; filename="Jan_Kominek_CV.pdf"')
})
