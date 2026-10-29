import type { CollectionConfig } from 'payload'
import { canReadContent, isAdmin } from '../access'
import { order, text, textarea } from '../fields'
import { revalidateCollectionAfterChange, revalidateCollectionAfterDelete } from '../hooks/revalidate'

export const Testimonials: CollectionConfig = {
	slug: 'testimonials',
	admin: { group: 'Content', useAsTitle: 'name', defaultColumns: ['name', 'role', 'order'] },
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
	fields: [
		order,
		{
			type: 'row',
			fields: [
				{ name: 'name', type: 'text', required: true },
				{ name: 'initials', type: 'text', required: true }
			]
		},
		text('role', { required: true }),
		textarea('quote', { required: true }),
		{ name: 'linkedinUrl', type: 'text', admin: { description: 'Where "Read more" points for long quotes.' } },
		{
			type: 'row',
			fields: [
				{ name: 'show', type: 'checkbox', defaultValue: true, label: 'Show on the home page' },
				{
					name: 'quoteLanguage',
					type: 'select',
					defaultValue: 'en',
					options: [
						{ label: 'English', value: 'en' },
						{ label: 'Czech', value: 'cs' }
					],
					admin: { description: 'Language the quote is written in, so screen readers pronounce it correctly.' }
				}
			]
		}
	]
}
