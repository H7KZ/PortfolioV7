import type { LayoutData, Locale } from '#shared/types/content'

export function useLocaleCode() {
	const { locale } = useI18n()
	return computed<Locale>(() => (locale.value === 'cs' ? 'cs' : 'en'))
}

/** Loads one content endpoint for the current locale; a missing page becomes a real 404. */
export async function useContent<T>(endpoint: string) {
	const locale = useLocaleCode()
	const result = await useFetch<T>(`/api/content/${endpoint}`, {
		key: computed(() => `content:${endpoint}:${locale.value}`),
		query: { locale }
	})
	if (result.error.value) {
		throw createError({ statusCode: result.error.value.statusCode ?? 500, statusMessage: result.error.value.statusMessage, fatal: true })
	}
	return result.data as Ref<T>
}

export function useLayoutContent() {
	const locale = useLocaleCode()
	return useFetch<LayoutData>('/api/content/layout', {
		key: computed(() => `content:layout:${locale.value}`),
		query: { locale }
	})
}
