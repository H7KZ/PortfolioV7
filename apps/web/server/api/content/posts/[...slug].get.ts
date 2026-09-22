export default defineEventHandler(async event => {
	const data = await content(event).post(getRouterParam(event, 'slug') ?? '', readLocale(event), isDraft(event))
	if (!data) throw createError({ statusCode: 404, statusMessage: 'Not Found' })
	return data
})
