export default defineEventHandler(event => {
	const { public: config } = useRuntimeConfig()
	if (config.noindex) return sendText(event, 'User-agent: *\nDisallow: /\n')
	return sendText(event, `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /_preview\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`)
})
