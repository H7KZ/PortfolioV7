import type { H3Event } from 'h3'

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

export async function securityTxt(event: H3Event): Promise<string> {
	const site = await content().site()
	const expires = new Date(Date.now() + ONE_YEAR_MS)
	expires.setUTCHours(0, 0, 0, 0)
	return sendText(
		event,
		[
			`Contact: mailto:${site.email}`,
			`Expires: ${expires.toISOString()}`,
			'Preferred-Languages: en, cs',
			`Canonical: ${site.siteUrl}/.well-known/security.txt`,
			''
		].join('\n')
	)
}
