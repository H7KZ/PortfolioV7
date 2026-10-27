import { lookup } from 'node:dns/promises'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'
import { config } from '../config'

/**
 * Every address behind a revalidate URL. A web with two replicas shares one network alias, and each
 * replica keeps its own page cache, so each one is told. A name that does not resolve keeps the URL as is.
 */
async function targets(url: string): Promise<string[]> {
	const parsed = new URL(url)
	try {
		const addresses = await lookup(parsed.hostname, { all: true })
		return addresses.map(({ address, family }) => {
			const target = new URL(url)
			target.hostname = family === 6 ? `[${address}]` : address
			return target.href
		})
	} catch {
		return [url]
	}
}

async function notifySites(source: string): Promise<void> {
	if (!config.revalidateSecret || config.revalidateUrls.length === 0) return

	const urls = (await Promise.all(config.revalidateUrls.map(targets))).flat()
	await Promise.allSettled(
		urls.map(async url => {
			try {
				const response = await fetch(url, {
					method: 'POST',
					headers: { 'content-type': 'application/json', 'x-revalidate-secret': config.revalidateSecret },
					body: JSON.stringify({ source }),
					signal: AbortSignal.timeout(5000)
				})
				if (!response.ok) console.warn(`revalidate.failed url=${url} status=${response.status}`)
			} catch (error) {
				console.warn(`revalidate.unreachable url=${url} error=${(error as Error).message}`)
			}
		})
	)
}

export const revalidateCollectionAfterChange: CollectionAfterChangeHook = async ({ collection, doc }) => {
	await notifySites(collection.slug)
	return doc
}

export const revalidateCollectionAfterDelete: CollectionAfterDeleteHook = async ({ collection, doc }) => {
	await notifySites(collection.slug)
	return doc
}

export const revalidateGlobalAfterChange: GlobalAfterChangeHook = async ({ global, doc }) => {
	await notifySites(global.slug)
	return doc
}
