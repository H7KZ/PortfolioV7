import { link, text } from '../fields'
import { defineGlobal } from './define'

export const Navigation = defineGlobal({
	slug: 'navigation',
	label: 'Navigation',
	group: 'Layout',
	fields: [
		{ name: 'monogram', type: 'text', required: true, defaultValue: 'J' },
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
		{ type: 'row', fields: [text('toggleLanguageLabel', { required: true }), text('toggleMenuLabel', { required: true })] }
	]
})
