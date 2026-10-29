/**
 * Sets the API key of existing users, for a database copied from another environment.
 *
 *   API_KEYS='{"reader@jankominek.com":"<key>","contact@jankominek.com":"<key>"}' pnpm --filter @portfolio/cms run api-keys:set
 *
 * Goes through Payload so the stored key index is hashed with this environment's PAYLOAD_SECRET.
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

const keys = JSON.parse(process.env.API_KEYS ?? '{}') as Record<string, string>
const payload = await getPayload({ config })
for (const [email, apiKey] of Object.entries(keys)) {
	const { docs } = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, depth: 0 })
	if (!docs[0]) throw new Error(`No user ${email}`)
	await payload.update({ collection: 'users', id: docs[0].id, data: { enableAPIKey: true, apiKey }, depth: 0 })
	console.log(`api key set for ${email}`)
}
process.exit(0)
