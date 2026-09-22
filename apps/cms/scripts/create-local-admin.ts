import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })
await payload.create({ collection: 'users', data: { email: 'admin@admin.com', password: 'admin', role: 'admin' } })
console.log('admin created')
process.exit(0)
