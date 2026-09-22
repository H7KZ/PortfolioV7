import type { TaskConfig } from 'payload'
import { CONTACT_RETENTION_MONTHS } from '../collections/contact-submissions'

export const purgeContactSubmissions: TaskConfig<{ input: object; output: { deleted: number } }> = {
	slug: 'purgeContactSubmissions',
	schedule: [{ cron: '0 3 * * *', queue: 'nightly' }],
	handler: async ({ req }) => {
		const cutoff = new Date()
		cutoff.setMonth(cutoff.getMonth() - CONTACT_RETENTION_MONTHS)

		const result = await req.payload.delete({
			collection: 'contact-submissions',
			where: { createdAt: { less_than: cutoff.toISOString() } },
			overrideAccess: true,
			req
		})

		const deleted = result.docs.length
		if (deleted > 0) req.payload.logger.info(`contact.retention_purged deleted=${deleted}`)
		return { output: { deleted } }
	}
}
