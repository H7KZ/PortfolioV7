import type { LayoutData } from '#shared/types/content'

type NavItem = NonNullable<LayoutData['navigation']['items']>[number]

export function useNavigation(layout: Ref<LayoutData | undefined>) {
	const route = useRoute()
	const locale = useLocaleCode()
	const { setLocale } = useI18n()
	const { track } = useAnalytics()

	const otherLocale = computed(() => (locale.value === 'en' ? 'cs' : 'en'))
	const barePath = computed(() => route.path.replace(/^\/cs(?=\/|$)/, '') || '/')
	const items = computed(() => (layout.value?.navigation.items ?? []).filter(item => item.visible !== false))

	function isActive(item: NavItem): boolean {
		return item.match === 'prefix' ? barePath.value.startsWith(item.href) : barePath.value === item.href
	}

	async function switchLocale(): Promise<void> {
		track('locale-switch', { to: otherLocale.value })
		await setLocale(otherLocale.value)
	}

	return { items, isActive, switchLocale, currentLocale: locale, otherLocale }
}
