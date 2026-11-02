function decoded(value: string): string | null {
	try {
		return decodeURIComponent(value)
	} catch {
		return null
	}
}

export default defineEventHandler(event => {
	const filename = decoded(getRouterParam(event, 'path') ?? '')
	if (!filename || filename.includes('/') || filename.includes('..') || filename.includes('\0')) {
		throw createError({ statusCode: 404, statusMessage: 'Not Found' })
	}
	return proxyMedia(event, filename)
})
