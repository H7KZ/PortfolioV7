const SKIP = /^\/(api|_nuxt|__nuxt|_internal|_preview|media|fonts|favicon)(\/|$)/

export default defineEventHandler(async event => {
	if (event.method !== 'GET' && event.method !== 'HEAD') return
	const url = getRequestURL(event)
	if (SKIP.test(url.pathname)) return

	const locale = url.searchParams.get('locale')
	if (locale === 'cs' || locale === 'en') {
		url.searchParams.delete('locale')
		// `/cs//host` loses its prefix here, and a Location of `//host` would leave the site.
		const bare = url.pathname.replace(/^\/cs(?=\/|$)/, '').replace(/^\/+/, '/') || '/'
		const pathname = locale === 'cs' ? (bare === '/' ? '/cs' : `/cs${bare}`) : bare
		const search = url.searchParams.toString()
		return sendRedirect(event, `${pathname}${search ? `?${search}` : ''}${url.hash}`, 301)
	}

	// The router also matches `/resume/` and `/RESUME`, and each would be its own canonical page.
	const normal = url.pathname.toLowerCase().replace(/\/+$/, '').replace(/^\/+/, '/') || '/'
	if (normal !== url.pathname) return sendRedirect(event, `${normal}${url.search}`, 301)

	const redirects = await content()
		.redirects()
		.catch(() => ({}) as Record<string, { to: string; permanent: boolean }>)
	const match = redirects[url.pathname]
	if (match) return sendRedirect(event, match.to, match.permanent ? 301 : 302)
})
