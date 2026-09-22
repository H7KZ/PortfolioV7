import type { CollectionConfig } from 'payload'
import { canReadContent, isAdmin } from '../access'
import { revalidateCollectionAfterChange, revalidateCollectionAfterDelete } from '../hooks/revalidate'

export const Redirects: CollectionConfig = {
	slug: 'redirects',
	admin: {
		group: 'Settings',
		useAsTitle: 'from',
		defaultColumns: ['from', 'to', 'permanent'],
		description: 'Old URLs that forward to a new location.'
	},
	access: {
		read: canReadContent,
		create: isAdmin,
		update: isAdmin,
		delete: isAdmin
	},
	hooks: {
		afterChange: [revalidateCollectionAfterChange],
		afterDelete: [revalidateCollectionAfterDelete]
	},
	fields: [
		{
			name: 'from',
			type: 'text',
			required: true,
			unique: true,
			index: true,
			validate: (value: string | null | undefined) => (value?.startsWith('/') ? true : 'Must start with /')
		},
		{ name: 'to', type: 'text', required: true },
		{ name: 'permanent', type: 'checkbox', defaultValue: true }
	]
}
