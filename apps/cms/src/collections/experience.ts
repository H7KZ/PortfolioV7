import type { CollectionConfig } from 'payload'
import { canReadContent, isAdmin } from '../access'
import { order, text, textarea } from '../fields'
import { revalidateCollectionAfterChange, revalidateCollectionAfterDelete } from '../hooks/revalidate'

export const Experience: CollectionConfig = {
	slug: 'experience',
	labels: { singular: 'Experience entry', plural: 'Experience' },
	admin: {
		group: 'Content',
		useAsTitle: 'role',
		defaultColumns: ['role', 'organization', 'kind', 'order'],
		description: 'Resume timeline entries.'
	},
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
		{
			name: 'kind',
			type: 'select',
			required: true,
			defaultValue: 'work',
			admin: { position: 'sidebar' },
			options: [
				{ label: 'Experience', value: 'work' },
				{ label: 'Own product', value: 'ownProduct' },
				{ label: 'Leadership & teaching', value: 'leadership' },
				{ label: 'Education', value: 'education' }
			]
		},
		order,
		{ name: 'current', type: 'checkbox', admin: { position: 'sidebar', description: 'Highlights the timeline dot.' } },
		{ type: 'row', fields: [text('dates', { required: true }), text('duration')] },
		text('role', { required: true }),
		text('organization', { required: true }),
		textarea('description'),
		{ name: 'highlights', type: 'array', fields: [text('text', { required: true })] },
		{
			name: 'chips',
			type: 'array',
			fields: [
				{
					type: 'row',
					fields: [
						{ name: 'label', type: 'text', required: true },
						{ name: 'accent', type: 'checkbox' }
					]
				}
			]
		}
	]
}
