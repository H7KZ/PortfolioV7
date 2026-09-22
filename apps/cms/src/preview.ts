import { createHmac } from 'node:crypto'
import { config } from './config'

const PREVIEW_TTL_MS = 60 * 60 * 1000

export function localizedPath(path: string, locale: string | undefined): string {
	if (!locale || locale === 'en') return path
	return path === '/' ? `/${locale}` : `/${locale}${path}`
}

export function previewUrl(path: string, locale: string | undefined): string {
	const target = localizedPath(path, locale)
	const expires = Date.now() + PREVIEW_TTL_MS
	const token = createHmac('sha256', config.previewSecret).update(`${target}|${expires}`).digest('base64url')
	const params = new URLSearchParams({ path: target, expires: String(expires), token })
	return `${config.siteUrl}/_preview?${params.toString()}`
}
