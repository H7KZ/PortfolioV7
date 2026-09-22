export default defineEventHandler(async event => {
	const { blog, site, posts } = await content().feed()
	const author = site.name
	const email = site.email

	const items = posts
		.map(post => {
			const url = `${site.siteUrl}/blog/${post.slug}`
			const tags = (post.tags ?? []).filter(tag => tag !== 'EN')
			const description = post.description ?? tags.join(', ')
			const categories = tags.map(tag => `    <category>${escapeXml(tag)}</category>`).join('\n')
			return `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <description>${escapeXml(description)}</description>
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <author>${email} (${escapeXml(author)})</author>
${categories}
  </item>`
		})
		.join('\n')

	const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(blog.feedTitle)}</title>
    <link>${site.siteUrl}/blog</link>
    <description>${escapeXml(blog.feedDescription)}</description>
    <language>en</language>
    <managingEditor>${email} (${escapeXml(author)})</managingEditor>
    <webMaster>${email} (${escapeXml(author)})</webMaster>
    <atom:link href="${site.siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`

	return sendText(event, feed, 'application/rss+xml')
})
