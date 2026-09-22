import type { H3Event } from 'h3'

export function sendText(event: H3Event, body: string | null | undefined, type = 'text/plain'): string {
	if (!body) throw createError({ statusCode: 404, statusMessage: 'Not Found' })
	setResponseHeader(event, 'content-type', `${type}; charset=utf-8`)
	setResponseHeader(event, 'cache-control', 'public, max-age=3600')
	return body
}

export function escapeXml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}
