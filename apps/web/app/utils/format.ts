export function formatDate(
	date: string,
	locale: string | null | undefined,
	options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric', timeZone: 'UTC' }
): string {
	return new Date(date).toLocaleDateString(locale ?? 'en', options)
}

/**
 * Stored rich text may open with its own h1, usually the title the page already shows. That one is dropped and any
 * other h1 moves down a level, so the page keeps a single h1.
 */
export function demoteHeadings(html: string | null | undefined): string {
	const body = (html ?? '').replace(/^\s*<h1[\s>][\s\S]*?<\/h1>\s*/, '')
	if (!/<h1[\s>]/.test(body)) return body
	return body.replace(/<(\/?)h([1-5])(?=[\s>])/g, (_match, slash: string, level: string) => `<${slash}h${Number(level) + 1}`)
}
