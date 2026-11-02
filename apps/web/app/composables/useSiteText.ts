/** Small site-wide strings from the layout content, for components that need them without a page payload. */
export function useSiteText() {
	const { data: layout } = useLayoutContent()
	return {
		newTabLabel: computed(() => layout.value?.site.newTabLabel ?? ''),
		calUrl: computed(() => (layout.value?.site.calLink ? `https://cal.com/${layout.value.site.calLink}` : null))
	}
}
