import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminField, isAdminOrSelf } from '../access'

export const Users: CollectionConfig = {
	slug: 'users',
	admin: {
		useAsTitle: 'email',
		group: 'Settings',
		description: 'People who can sign in, plus the API-key accounts the websites use (reader for content, contact for the form).'
	},
	auth: {
		useAPIKey: true,
		maxLoginAttempts: 5,
		lockTime: 15 * 60 * 1000
	},
	access: {
		admin: ({ req }) => (req.user as { role?: string } | null)?.role === 'admin',
		create: isAdmin,
		read: isAdminOrSelf,
		update: isAdminOrSelf,
		delete: isAdmin
	},
	fields: [
		{
			name: 'role',
			type: 'select',
			required: true,
			defaultValue: 'admin',
			saveToJWT: true,
			access: { update: isAdminField },
			options: [
				{ label: 'Admin (full access)', value: 'admin' },
				{ label: 'Reader (website content API key)', value: 'reader' },
				{ label: 'Contact (contact form API key)', value: 'contact' }
			]
		}
	]
}
