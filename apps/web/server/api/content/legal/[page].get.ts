export default defineEventHandler(event => {
	const page = getRouterParam(event, 'page')
	if (page !== 'privacy' && page !== 'terms') throw createError({ statusCode: 404, statusMessage: 'Not Found' })
	return content(event).legal(page, readLocale(event), isDraft(event))
})
