import { timingSafeEqual } from 'node:crypto'

export default defineEventHandler(async event => {
	const expected = Buffer.from(useRuntimeConfig().revalidateSecret)
	const provided = Buffer.from(getHeader(event, 'x-revalidate-secret') ?? '')
	if (expected.length === 0 || provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
		throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
	}

	await clearContentCache()
	return { ok: true }
})
