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
						text('eyebrowCommand', { admin: { description: 'Monospace command line above the headline. The $ prompt is drawn by the site.' } }),
						text('eyebrowCommandShort', {
							admin: {
								description:
									'Shorter command line for phones, e.g. whoami  # Prague, CZ. Two spaces before the #. Falls back to the main command line when empty.'
							}
						}),
						textarea('headline', { admin: { description: 'A line break in the text becomes a line break on the page.' } }),
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
						group('portraitCaption', [{ type: 'row', fields: [text('user'), text('path'), text('note')] }], {
							admin: { description: 'Terminal-style caption bar under the portrait, e.g. jan@prague ~ · shipping since 2022.' }
						}),
						group('availability', [{ type: 'row', fields: [text('status', { required: true }), text('detail')] }], {
							admin: { description: 'The detail text is the availability line under the buttons.' }
						}),
						textarea('geoSummary', { admin: { description: 'Hidden paragraph for screen readers and AI crawlers.' } })
					]
				},
				{
					label: 'Now',
					fields: [
						group(
							'now',
							[
								text('label', { required: true }),
								{
									name: 'items',
									type: 'array',
									admin: { description: 'Key and value rows, e.g. "Running" and "Kreditožrouti, 200+ VŠE students".' },
									fields: [{ type: 'row', fields: [text('key', { required: true }), text('value', { required: true })] }]
								},
								text('title', { required: true, admin: { description: 'V6 only, not shown since V7.' } }),
								textarea('description'),
								text('date'),
								text('meta')
							],
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
						group(
							'more',
							[
								text('heading', { required: true }),
								textarea('sub'),
								{
									name: 'items',
									type: 'array',
									admin: { description: 'Rows without a link render as plain text.' },
									fields: [
										{ type: 'row', fields: [text('meta', { required: true }), text('title', { required: true })] },
										textarea('description'),
										{
											type: 'row',
											fields: [
												text('linkLabel'),
												{ name: 'href', type: 'text' },
												{ name: 'external', type: 'checkbox', admin: { description: 'Opens in a new tab.' } }
											]
										}
									]
								}
							],
							{ label: 'More work' }
						),
						sectionHeader('services', 'Services'),
						sectionHeader('testimonials', 'Testimonials'),
						{
							type: 'row',
							fields: [
								text('readMoreLabel', { required: true }),
								text('allRecommendationsLabel', {
									admin: {
										description:
											'Link under the quotes to all LinkedIn recommendations. {count} becomes the number of testimonials, e.g. "See all {count} recommendations on LinkedIn ↗".'
									}
								}),
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
