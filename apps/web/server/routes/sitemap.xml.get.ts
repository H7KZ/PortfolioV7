const LOCALES = ['en', 'cs'] as const

function localized(site: string, path: string, locale: (typeof LOCALES)[number]): string {
	if (locale === 'en') return `${site}${path}`
	return path === '/' ? `${site}/cs` : `${site}/cs${path}`
}

export default defineEventHandler(async event => {
	const site = useRuntimeConfig().public.siteUrl
	const { projects, posts } = await content().sitemap()

	const pages: { path: string; priority: string; lastmod?: string }[] = [
		{ path: '/', priority: '1.0' },
		{ path: '/resume', priority: '0.6' },
		{ path: '/contact', priority: '0.6' },
		{ path: '/blog', priority: '0.5' },
		...projects.map(project => ({ path: `/projects/${project.slug}`, priority: '0.8', lastmod: project.updatedAt })),
		...posts.map(post => ({ path: `/blog/${post.slug}`, priority: '0.7', lastmod: post.updatedAt })),
		{ path: '/privacy', priority: '0.2' },
		{ path: '/terms', priority: '0.2' }
	]

	const urls = pages.flatMap(({ path, priority, lastmod }) =>
		LOCALES.map(locale => {
			const alternates = LOCALES.map(alt => `    <xhtml:link rel="alternate" hreflang="${alt}" href="${localized(site, path, alt)}" />`).join('\n')
			return `  <url>
    <loc>${localized(site, path, locale)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${localized(site, path, 'en')}" />
  </url>`
		})
	)

	return sendText(
		event,
		`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`,
		'application/xml'
	)
})
