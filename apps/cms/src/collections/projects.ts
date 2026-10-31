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
						text('kicker', { admin: { description: 'Small line above the title, e.g. "CORAC Engineering · 2025–2026".' } }),
						{
							name: 'thumbnail',
							type: 'upload',
							relationTo: 'media',
							admin: { description: 'Hero image of the case study and image of the home card.' }
						},
						{
							type: 'row',
							fields: [
								{ name: 'heroPath', type: 'text', admin: { description: 'Path shown in the window title bar of the hero.' } },
								text('heroPlaceholderLabel', { admin: { description: 'Shown instead of the hero image while none is uploaded.' } }),
								text('heroPlaceholderSpec')
							]
						},
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
						{
							name: 'screens',
							type: 'array',
							label: 'Gallery',
							admin: {
								description: 'Window frames under the stack. A row without an image shows its placeholder label and spec until one is uploaded.'
							},
							fields: [
								{
									type: 'row',
									fields: [
										{ name: 'image', type: 'upload', relationTo: 'media' },
										{ name: 'path', type: 'text' }
									]
								},
								{
									name: 'crop',
									type: 'select',
									defaultValue: 'default',
									options: [
										{ label: 'Default (natural proportions)', value: 'default' },
										{ label: 'Strip (wide 1198:400 band, cropped to fill)', value: 'strip' }
									],
									admin: { description: 'How the image is framed in its window. Strip suits wide, short crops of phone or admin screens.' }
								},
								{ type: 'row', fields: [text('placeholderLabel'), text('placeholderSpec')] }
							]
						},
						{
							name: 'gallery',
							type: 'upload',
							relationTo: 'media',
							hasMany: true,
							admin: { description: 'V6 only, not shown since V7. Use Gallery above.' }
						}
					]
				},
				{
					label: 'Architecture',
					description: 'Optional diagram on the case study. Leave the nodes empty to hide it.',
					fields: [
						group(
							'architecture',
							[
								{
									name: 'nodes',
									type: 'array',
									admin: { description: 'The key ties a node to its place in the diagram and must stay stable.' },
									fields: [
										{
											type: 'row',
											fields: [
												{ name: 'key', type: 'text', required: true },
												text('name', { required: true }),
												text('tech'),
												{
													name: 'external',
													type: 'checkbox',
													admin: { description: 'Outside the system, drawn with a dashed border.' }
												}
											]
										}
									]
								},
								{
									name: 'edges',
									type: 'array',
									fields: [
										{
											type: 'row',
											fields: [
												{ name: 'from', type: 'text', required: true },
												{ name: 'to', type: 'text', required: true },
												{
													name: 'kind',
													type: 'select',
													required: true,
													defaultValue: 'sync',
													options: [
														{ label: 'Request path', value: 'request' },
														{ label: 'Sync call', value: 'sync' },
														{ label: 'Async', value: 'async' }
													]
												},
												{ name: 'bidirectional', type: 'checkbox' }
											]
										},
										{ type: 'row', fields: [text('label'), text('labelShort', { admin: { description: 'Used on phones.' } })] }
									]
								},
								group('legend', [{ type: 'row', fields: [text('request'), text('sync'), text('async')] }]),
								textarea('observability'),
								textarea('caption'),
								textarea('textAlternative', {
									admin: { description: 'Read by screen readers instead of the drawing. Describe the flow in sentences.' }
								})
							],
							{ label: false }
						)
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
								{
									type: 'row',
									fields: [
										text('meta', { admin: { description: 'Line above the title, e.g. "IONT tech / Fullstack".' } }),
										{ name: 'year', type: 'text', admin: { description: 'e.g. 2023–2024' } }
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
