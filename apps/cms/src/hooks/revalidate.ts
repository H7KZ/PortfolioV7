import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'
import { config } from '../config'

async function notifySites(source: string): Promise<void> {
	if (!config.revalidateSecret || config.revalidateUrls.length === 0) return

	await Promise.allSettled(
		config.revalidateUrls.map(async url => {
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
