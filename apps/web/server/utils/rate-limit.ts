import type { H3Event } from 'h3'

const WINDOW_MS = 10 * 60 * 1000
const MAX_HITS = 5
const hits = new Map<string, number[]>()

export function clientIp(event: H3Event): string {
	return (
		getHeader(event, 'cf-connecting-ip') ?? getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ?? event.node.req.socket.remoteAddress ?? 'unknown'
	)
}

export function rateLimited(event: H3Event): boolean {
	const now = Date.now()
	const key = clientIp(event)
	const recent = (hits.get(key) ?? []).filter(time => now - time < WINDOW_MS)
	recent.push(now)
	hits.set(key, recent)

	if (hits.size > 10_000) {
		for (const [ip, times] of hits) if (times.every(time => now - time >= WINDOW_MS)) hits.delete(ip)
	}
	return recent.length > MAX_HITS
}
