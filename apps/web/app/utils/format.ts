export function formatDate(
	date: string,
	locale: string | null | undefined,
	options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric', timeZone: 'UTC' }
): string {
	return new Date(date).toLocaleDateString(locale ?? 'en', options)
}

function escapeHtml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Escapes CMS text and turns **double asterisks** into <strong>. */
export function emphasis(value: string | null | undefined): string {
	return escapeHtml(value ?? '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

export function thousands(value: number): string {
	return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
