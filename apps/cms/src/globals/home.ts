import { group, link, sectionHeader, text, textarea } from '../fields'
import { defineGlobal } from './define'

export const Home = defineGlobal({
	slug: 'home',
	label: 'Home page',
	group: 'Pages',
	previewPath: '/',
	fields: [
		{
			type: 'tabs',
			tabs: [
				{
					label: 'Hero',
					fields: [
						{
							name: 'taglines',
							type: 'array',
							admin: { description: 'Small line above the name. The first item is highlighted.' },
							fields: [text('text', { required: true })]
						},
						{ type: 'row', fields: [text('firstName', { required: true }), text('lastName', { required: true })] },
						textarea('valueProp', { required: true, admin: { description: 'Wrap words in **double asterisks** to highlight them.' } }),
						link('primaryCta', 'Primary button'),
						link('secondaryCta', 'Secondary button'),
						{
							name: 'stats',
							type: 'array',
							fields: [{ type: 'row', fields: [text('value', { required: true }), text('label', { required: true })] }]
						},
						{ name: 'portrait', type: 'upload', relationTo: 'media' },
						group('availability', [{ type: 'row', fields: [text('status', { required: true }), text('detail')] }], {
							admin: { description: 'Badge on the portrait.' }
						}),
						textarea('geoSummary', { admin: { description: 'Hidden paragraph for screen readers and AI crawlers.' } })
					]
				},
				{
					label: 'Now',
					fields: [
						group(
							'now',
							[text('label', { required: true }), text('title', { required: true }), textarea('description'), text('date'), text('meta')],
							{
								label: false
							}
						)
					]
				},
				{
					label: 'Sections',
					fields: [
						sectionHeader('work', 'Selected work'),
						{ type: 'row', fields: [text('viewProjectLabel', { required: true }), text('readCaseStudyLabel', { required: true })] },
						sectionHeader('services', 'Services'),
						sectionHeader('testimonials', 'Testimonials'),
						{
							type: 'row',
							fields: [
								text('readMoreLabel', { required: true }),
								{
									name: 'quoteLimit',
									type: 'number',
									defaultValue: 450,
									admin: { description: 'Longer quotes are cut and link to LinkedIn.' }
								}
							]
						}
					]
				}
			]
		}
	]
})
