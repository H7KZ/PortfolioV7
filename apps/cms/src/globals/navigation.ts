import { group, link, text } from '../fields'
import { defineGlobal } from './define'

export const Navigation = defineGlobal({
	slug: 'navigation',
	label: 'Navigation',
	group: 'Layout',
	fields: [
		{ name: 'monogram', type: 'text', required: true, defaultValue: 'J', admin: { description: 'V6 only, not shown since V7.' } },
		{ name: 'wordmark', type: 'text', admin: { description: 'Text logo in the top left, e.g. jankominek.com.' } },
		text('navLabel', { admin: { description: 'Accessible name of the main navigation landmark.' } }),
		text('homeLabel', { required: true, admin: { description: 'Accessible label of the monogram link.' } }),
		{
			name: 'items',
			type: 'array',
			fields: [
				{
					type: 'row',
					fields: [
						text('label', { required: true }),
						{ name: 'href', type: 'text', required: true },
						{
							name: 'match',
							type: 'select',
							defaultValue: 'exact',
							options: [
								{ label: 'Active on this exact page', value: 'exact' },
								{ label: 'Active on this page and below', value: 'prefix' }
							]
						},
						{ name: 'visible', type: 'checkbox', defaultValue: true }
					]
				}
			]
		},
		link('hire', 'Hire button'),
		{
			type: 'row',
			fields: [
				text('toggleLanguageLabel', {
					required: true,
					admin: { description: 'Language switcher labels, English first, separated by a slash: EN / CS.' }
				}),
				text('toggleMenuLabel', { required: true }),
				text('closeMenuLabel')
			]
		},
		text('currentLabel', { admin: { description: 'Marker next to the current page in the mobile menu.' } }),
		group('languageNames', [{ type: 'row', fields: [text('en'), text('cs')] }], {
			admin: { description: 'Names in the language switcher, each written in its own language.' }
		}),
		group(
			'mobileMenu',
			[
				{
					name: 'extraItems',
					type: 'array',
					admin: { description: 'Links shown only in the mobile menu, after the main items.' },
					fields: [{ type: 'row', fields: [text('label', { required: true }), { name: 'href', type: 'text', required: true }] }]
				},
				link('primaryCta', 'Primary button', false),
				{ name: 'email', type: 'text' }
			],
			{ label: 'Mobile menu' }
		)
	]
})
