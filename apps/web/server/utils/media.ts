import type { H3Event } from 'h3'

const PASSTHROUGH_HEADERS = ['content-type', 'content-length', 'etag', 'last-modified']

export async function proxyMedia(event: H3Event, filename: string, disposition?: string): Promise<ReadableStream | null> {
	const { cmsInternalUrl, cmsReadApiKey } = useRuntimeConfig()
	const response = await fetch(`${cmsInternalUrl}/api/media/file/${encodeURIComponent(filename)}`, {
		headers: {
			...(cmsReadApiKey ? { authorization: `users API-Key ${cmsReadApiKey}` } : {}),
			...(getHeader(event, 'if-none-match') ? { 'if-none-match': getHeader(event, 'if-none-match')! } : {})
		},
		signal: AbortSignal.timeout(30_000)
	}).catch(() => null)

	if (!response) throw createError({ statusCode: 503, statusMessage: 'Service Unavailable' })
	if (response.status === 304) {
		setResponseStatus(event, 304)
		return null
	}
	// Payload answers 500 for a file that is not on the disk, so a dead link is not a CMS outage.
	if (response.status === 404 || response.status === 500) throw createError({ statusCode: 404, statusMessage: 'Not Found' })
	if (!response.ok || !response.body) throw createError({ statusCode: 502, statusMessage: 'Bad Gateway' })

	for (const header of PASSTHROUGH_HEADERS) {
		const value = response.headers.get(header)
		if (value) setResponseHeader(event, header, value)
	}
	setResponseHeader(event, 'cache-control', 'public, max-age=86400, stale-while-revalidate=604800')
	setResponseHeader(event, 'x-content-type-options', 'nosniff')
	if (disposition) setResponseHeader(event, 'content-disposition', disposition)
	return response.body
}
