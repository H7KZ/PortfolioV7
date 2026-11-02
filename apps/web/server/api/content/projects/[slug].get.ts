export default defineEventHandler(async event => {
	const slug = getRouterParam(event, 'slug')
	const known = isSlug(slug) && (isDraft(event) || (await content(event).slugs()).projects.includes(slug))
	const data = known ? await content(event).project(slug as string, readLocale(event), isDraft(event)) : null
	if (!data) throw createError({ statusCode: 404, statusMessage: 'Not Found' })
	return data
})
