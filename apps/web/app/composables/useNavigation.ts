import type { LayoutData, Locale } from '#shared/types/content'

const LOCALES: Locale[] = ['en', 'cs']

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

	/** Case studies belong to the work section, so its link is current there without being the page itself. */
	function currentOf(item: NavItem): 'page' | 'true' | undefined {
		if (isActive(item)) return 'page'
		const [path, hash] = item.href.split('#')
		if ((path || '/') === '/' && hash === 'work' && barePath.value.startsWith('/projects/')) return 'true'
		return undefined
	}

	function localePath(target: Locale): string {
		return switchLocalePath(target) || (target === 'cs' ? '/cs' : '/')
	}

	function trackSwitch(target: Locale): void {
		track('locale-switch', { to: target })
	}

	return { items, isActive, currentOf, locales: LOCALES, currentLocale: locale, otherLocale, languageNames, localePath, trackSwitch }
}
