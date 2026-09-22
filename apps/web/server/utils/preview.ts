import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

export const PREVIEW_COOKIE = 'portfolio_preview'

function sign(value: string): string {
	return createHmac('sha256', useRuntimeConfig().previewSecret).update(value).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
	const left = Buffer.from(a)
	const right = Buffer.from(b)
	return left.length === right.length && timingSafeEqual(left, right)
}

export function verifyPreviewLink(path: string, expires: string, token: string): boolean {
	if (!path.startsWith('/') || path.startsWith('//')) return false
	if (!/^\d+$/.test(expires) || Number(expires) < Date.now()) return false
	return safeEqual(sign(`${path}|${expires}`), token)
}

export function previewCookieValue(expires: string): string {
	return `${expires}.${sign(`cookie|${expires}`)}`
}

export function isPreview(event: H3Event): boolean {
	const value = getCookie(event, PREVIEW_COOKIE)
	if (!value) return false
	const [expires, signature] = value.split('.')
	if (!expires || !signature || Number(expires) < Date.now()) return false
	return safeEqual(sign(`cookie|${expires}`), signature)
}
