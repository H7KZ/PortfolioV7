/**
 * Sets the password of an existing user and clears any lockout. The CMS sends no email, so "Forgot password" cannot do this.
 *
 *   USER_EMAIL=<email> USER_PASSWORD=<password> pnpm --filter @portfolio/cms run password:set
 *
 * Goes through Payload so the hash uses the current format. Pass the password in the environment only, never commit it.
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

const email = process.env.USER_EMAIL
const password = process.env.USER_PASSWORD
if (!email || !password) throw new Error('USER_EMAIL and USER_PASSWORD are required')

const payload = await getPayload({ config })
const { docs } = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, depth: 0 })
if (!docs[0]) throw new Error(`No user ${email}`)
await payload.update({ collection: 'users', id: docs[0].id, data: { password }, depth: 0 })
await payload.unlock({ collection: 'users', data: { email }, overrideAccess: true })
console.log(`password set and lockout cleared for ${email}`)
process.exit(0)
