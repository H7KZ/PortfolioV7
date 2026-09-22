const PASSTHROUGH = /^\/(media|cv\.pdf|feed\.xml|fonts|favicon|files|images)(\/|$)/

/** Localizes internal links from the CMS; external, mail and asset links pass through untouched. */
export function useHref() {
	const localePath = useLocalePath()
	return (href: string | null | undefined): string => {
		if (!href) return '#'
		if (!href.startsWith('/') || href.startsWith('//') || PASSTHROUGH.test(href)) return href
		const [path, hash] = href.split('#')
		const localized = localePath(path || '/')
		return hash ? `${localized}#${hash}` : localized
	}
}
