import type { CollectionAfterChangeHook } from 'payload'
import { config } from '../config'

function isDiscordWebhook(url: string): boolean {
	try {
		const parsed = new URL(url)
		return (
			parsed.protocol === 'https:' &&
			(parsed.hostname === 'discord.com' || parsed.hostname === 'discordapp.com') &&
			parsed.pathname.startsWith('/api/webhooks/')
		)
	} catch {
		return false
	}
}

function sender(doc: { company?: string | null; email?: string | null }): string {
	const company = doc.company?.trim()
	if (company) return company
	const domain = doc.email?.split('@')[1]?.trim()
	return domain || 'unknown'
}

function neutraliseMentions(input: string): string {
	return input.replace(/@(everyone|here)/gi, '[@$1]').replace(/[`*_~|>]/g, '')
}

export const notifyDiscord: CollectionAfterChangeHook = async ({ doc, operation, collection }) => {
	if (operation !== 'create') return doc
	if (!isDiscordWebhook(config.discordWebhookUrl)) {
		console.warn('contact.discord_skipped reason=webhook_not_configured')
		return doc
	}

	const entryUrl = `${config.cmsUrl}/admin/collections/${collection.slug}/${doc.id}`

	try {
		const response = await fetch(config.discordWebhookUrl, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				content: `New inquiry from ${neutraliseMentions(sender(doc))}\n${entryUrl}`,
				allowed_mentions: { parse: [] }
			}),
			signal: AbortSignal.timeout(10_000)
		})
		if (!response.ok) console.warn(`contact.discord_failed status=${response.status}`)
	} catch (error) {
		console.warn(`contact.discord_unreachable error=${(error as Error).message}`)
	}

	return doc
}
