import type { Page, Response } from '@playwright/test'

export const LOCALES = ['en', 'cs'] as const
export type Locale = (typeof LOCALES)[number]

/** Every page and page family in docs/redesign/design/frame-map.md. */
export const ROUTES = [
	'/',
	'/projects/kreditozrouti',
	'/projects/deeptrace',
	'/projects/iont_platform',
	'/projects/intedat',
	'/projects/corac_scorecard',
	'/projects/disenchantment',
	'/resume',
	'/contact',
	'/blog',
	'/blog/traefik_with_cloudflare_inside_docker_simplified',
	'/privacy',
	'/terms'
] as const

export const NOT_FOUND = '/this-page-does-not-exist'

export const DESIGN_WIDTHS = [390, 768, 1440] as const
export const OVERFLOW_WIDTHS = [320, 360, 390, 414, 600, 768, 900, 1024, 1280, 1440, 1920] as const

export function localized(path: string, locale: Locale): string {
	if (locale === 'en') return path
	return path === '/' ? '/cs' : `/cs${path}`
}

export const BASE_URL = process.env.REDESIGN_BASE_URL ?? 'http://localhost:3000'

/** The locale cookie decides where `/` goes, so pin it to the locale under test. */
export async function pinLocale(page: Page, locale: Locale): Promise<void> {
	await page.context().addCookies([{ name: 'locale', value: locale, url: BASE_URL }])
}

export function slug(path: string): string {
	return path === '/' ? 'home' : path.replace(/^\//, '').replace(/[/_]/g, '-')
}

/** Waits for the page and its fonts; a dev server keeps a socket open, so network idle is a bonus, not a requirement. */
export async function open(page: Page, path: string): Promise<Response | null> {
	const response = await page.goto(path, { waitUntil: 'load' })
	await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => undefined)
	await page.evaluate(() => document.fonts.ready)
	return response
}
