export function formatDate(
	date: string,
	locale: string | null | undefined,
	options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric', timeZone: 'UTC' }
): string {
	return new Date(date).toLocaleDateString(locale ?? 'en', options)
}
