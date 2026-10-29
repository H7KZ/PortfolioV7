const LEADING = /^([←↑↓→↗]\s?)/
const TRAILING = /(\s?[←↑↓→↗])$/

/** Splits decorative arrows off CMS labels such as "← All work" or "Read more ↗", so they can be hidden from screen readers. */
export function splitGlyphs(label: string | null | undefined): { before: string; text: string; after: string } {
	const value = label ?? ''
	const before = value.match(LEADING)?.[1] ?? ''
	const rest = value.slice(before.length)
	const after = rest.match(TRAILING)?.[1] ?? ''
	return { before, text: rest.slice(0, rest.length - after.length), after }
}

/** Cuts text at `limit` characters on a word boundary and marks the cut with an ellipsis. */
export function truncateWords(text: string, limit: number): { text: string; truncated: boolean } {
	if (text.length <= limit) return { text, truncated: false }
	const slice = text.slice(0, limit + 1)
	const lastSpace = slice.lastIndexOf(' ')
	const cut = (lastSpace > limit * 0.6 ? slice.slice(0, lastSpace) : slice.slice(0, limit)).replace(/[\s,.;:!?]+$/, '')
	return { text: `${cut}…`, truncated: true }
}

export function isExternal(href: string | null | undefined): boolean {
	return Boolean(href && /^(https?:)?\/\//.test(href))
}
