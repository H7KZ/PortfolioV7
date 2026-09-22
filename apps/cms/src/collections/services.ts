import type { CollectionConfig } from 'payload'
import { canReadContent, isAdmin } from '../access'
import { chips, order, text, textarea } from '../fields'
import { revalidateCollectionAfterChange, revalidateCollectionAfterDelete } from '../hooks/revalidate'

export const Services: CollectionConfig = {
	slug: 'services',
	admin: { group: 'Content', useAsTitle: 'title', defaultColumns: ['title', 'number', 'order'] },
	versions: { drafts: true, maxPerDoc: 25 },
	access: {
		read: canReadContent,
		create: isAdmin,
		update: isAdmin,
		delete: isAdmin
	},
	defaultSort: 'order',
	hooks: {
		afterChange: [revalidateCollectionAfterChange],
		afterDelete: [revalidateCollectionAfterDelete]
	},
	fields: [order, text('number', { required: true }), text('title', { required: true }), textarea('description', { required: true }), chips]
}
