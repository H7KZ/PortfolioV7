import { text, textarea } from '../fields'
import { defineGlobal } from './define'

export const Footer = defineGlobal({
	slug: 'footer',
	label: 'Footer',
	group: 'Layout',
	description: 'The "Contact me" block at the bottom of pages, plus the legal links line.',
	fields: [
		text('label', { required: true }),
		textarea('headingBefore', { required: true, admin: { description: 'Text before the button. A line break becomes a line break.' } }),
		text('ctaLabel', { required: true }),
		{ name: 'ctaHref', type: 'text', required: true, defaultValue: '/contact' },
		text('headingAfter'),
		{
			name: 'links',
			type: 'array',
			fields: [
				{
					type: 'row',
					fields: [
						text('label', { required: true }),
						{ name: 'href', type: 'text', required: true },
						{ name: 'external', type: 'checkbox', admin: { description: 'Opens in a new tab.' } },
						{ name: 'arrow', type: 'checkbox', defaultValue: true, admin: { description: 'Shows ↗ after the label.' } }
					]
				}
			]
		},
		{ type: 'row', fields: [text('privacyLabel', { required: true }), text('termsLabel', { required: true })] }
	]
})
