import type { CollectionConfig } from 'payload'
import { canReadContent, isAdmin } from '../access'
import { chips, group, order, slug, text, textarea } from '../fields'
import { revalidateCollectionAfterChange, revalidateCollectionAfterDelete } from '../hooks/revalidate'
import { previewUrl } from '../preview'
import { richTextWithHtml } from '../rich-text/fields'

export const Projects: CollectionConfig = {
	slug: 'projects',
	admin: {
		group: 'Content',
		useAsTitle: 'title',
		defaultColumns: ['title', 'slug', 'date', 'order', '_status'],
		preview: (doc, { locale }) => previewUrl(`/projects/${doc.slug as string}`, locale)
	},
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
		slug,
		{ name: 'date', type: 'date', required: true, admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } } },
		order,
		{
			type: 'tabs',
			tabs: [
				{
					label: 'Case study',
					fields: [
						text('title', { required: true }),
						{
							name: 'layout',
							type: 'select',
							required: true,
							defaultValue: 'caseStudy',
							options: [
								{ label: 'Case study (hero, facts, impact, contributions)', value: 'caseStudy' },
								{ label: 'Simple (tags, thumbnail, text)', value: 'simple' }
							]
						},
						{ name: 'tags', type: 'text', hasMany: true, localized: true },
						{ name: 'thumbnail', type: 'upload', relationTo: 'media' },
						textarea('lede', {
							admin: { description: 'Intro under the title. Also used as the meta description when no SEO description is set.' }
						}),
						{
							type: 'row',
							fields: [text('client'), text('role'), text('team'), text('timeline'), text('sector')]
						},
						{
							name: 'impact',
							type: 'array',
							fields: [text('label', { required: true }), text('value', { required: true }), text('sub')]
						},
						...richTextWithHtml('content', { label: 'The challenge' }),
						{
							name: 'contributions',
							type: 'array',
							fields: [text('num', { localized: false }), text('title', { required: true }), textarea('body')]
						},
						{ name: 'stack', type: 'text', hasMany: true },
						{ name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true }
					]
				},
				{
					label: 'Home card',
					fields: [
						group(
							'card',
							[
								{ name: 'show', type: 'checkbox', defaultValue: true, label: 'Show on the home page' },
								{
									name: 'size',
									type: 'select',
									defaultValue: 'default',
									options: [
										{ label: 'Featured (full width)', value: 'featured' },
										{ label: 'Wide (2/3)', value: 'wide' },
										{ label: 'Narrow (1/3)', value: 'narrow' },
										{ label: 'Default (1/2)', value: 'default' }
									]
								},
								{ type: 'row', fields: [text('company'), text('role')] },
								text('badge'),
								textarea('description'),
								chips,
								{
									name: 'cta',
									type: 'select',
									defaultValue: 'viewProject',
									options: [
										{ label: 'View project', value: 'viewProject' },
										{ label: 'Read case study', value: 'readCaseStudy' }
									]
								}
							],
							{ label: false }
						)
					]
				}
			]
		}
	]
}
