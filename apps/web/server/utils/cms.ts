import type { Locale, MediaView } from '#shared/types/content'
import type { H3Event } from 'h3'

type QueryValue = string | number | boolean | undefined | null | QueryObject | QueryValue[]
interface QueryObject {
	[key: string]: QueryValue
}

function flatten(prefix: string, value: QueryValue, out: URLSearchParams): void {
	if (value === undefined || value === null) return
	if (Array.isArray(value)) {
		value.forEach((item, index) => flatten(`${prefix}[${index}]`, item, out))
		return
	}
	if (typeof value === 'object') {
		for (const [key, nested] of Object.entries(value)) flatten(prefix ? `${prefix}[${key}]` : key, nested, out)
		return
	}
	out.append(prefix, String(value))
}

export class CmsUnavailableError extends Error {}

export async function cmsFetch<T>(path: string, query: QueryObject = {}): Promise<T> {
	const { cmsInternalUrl, cmsReadApiKey } = useRuntimeConfig()
	const params = new URLSearchParams()
	flatten('', query, params)

	const response = await fetch(`${cmsInternalUrl}/api${path}?${params.toString()}`, {
		headers: cmsReadApiKey ? { authorization: `users API-Key ${cmsReadApiKey}` } : {},
		signal: AbortSignal.timeout(10_000)
	}).catch(error => {
		throw new CmsUnavailableError(`cms unreachable: ${(error as Error).message}`)
	})

	if (response.status === 404) return null as T
	if (!response.ok) throw new CmsUnavailableError(`cms ${path} responded ${response.status}`)
	return (await response.json()) as T
}

function isMedia(value: Record<string, unknown>): boolean {
	return typeof value.filename === 'string' && 'mimeType' in value && 'filesize' in value
}

function siteUrl(filename: unknown): string | null {
	return typeof filename === 'string' && filename ? `/media/${encodeURIComponent(filename)}` : null
}

function toMediaView(value: Record<string, unknown>): MediaView {
	const formats = (value.formats ?? {}) as Record<string, unknown>
	return {
		url: `/media/${encodeURIComponent(value.filename as string)}`,
		filename: value.filename as string,
		alt: (value.alt as string | null) ?? '',
		mimeType: (value.mimeType as string | null) ?? null,
		width: (value.width as number | null) ?? null,
		height: (value.height as number | null) ?? null,
		formats: { avif: siteUrl(formats.avif), avif800: siteUrl(formats.avif800), webp800: siteUrl(formats.webp800) }
	}
}

/** Rewrites populated media to site-relative views and drops raw Lexical JSON when its rendered HTML sibling exists. */
export function resolve<T>(value: T): T {
	if (Array.isArray(value)) return value.map(item => resolve(item)) as T
	if (typeof value !== 'object' || value === null) return value

	const record = value as Record<string, unknown>
	if (isMedia(record)) return toMediaView(record) as T

	const out: Record<string, unknown> = {}
	for (const [key, nested] of Object.entries(record)) {
		if (typeof record[`${key}Html`] === 'string') continue
		out[key] = resolve(nested)
	}
	return out as T
}

export function readLocale(event: H3Event): Locale {
	const locale = getQuery(event).locale
	return locale === 'cs' ? 'cs' : 'en'
}
