import type { LayoutData, Locale } from '#shared/types/content'

interface NavItem {
	href: string
	match?: 'exact' | 'prefix' | null
}

export function useNavigation(layout: Ref<LayoutData | undefined>) {
	const route = useRoute()
	const locale = useLocaleCode()
	const switchLocalePath = useSwitchLocalePath()
	const { track } = useAnalytics()

	const otherLocale = computed<Locale>(() => (locale.value === 'en' ? 'cs' : 'en'))
	const barePath = computed(() => route.path.replace(/^\/cs(?=\/|$)/, '') || '/')
	const items = computed(() => (layout.value?.navigation.items ?? []).filter(item => item.visible !== false))
	const languageNames = computed(() => layout.value?.navigation.languageNames)

	/** Hash links such as /#work count as the page they live on. */
	function isActive(item: NavItem): boolean {
		const path = item.href.split('#')[0] || '/'
		return item.match === 'prefix' ? barePath.value.startsWith(path) : barePath.value === path
	}

	function localePath(target: Locale): string {
		return switchLocalePath(target) || (target === 'cs' ? '/cs' : '/')
	}

	function trackSwitch(target: Locale): void {
		track('locale-switch', { to: target })
	}

	return { items, isActive, currentLocale: locale, otherLocale, languageNames, localePath, trackSwitch }
}
