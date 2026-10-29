import { group, link, text, textarea } from '../fields'
import { defineGlobal } from './define'

export const Footer = defineGlobal({
	slug: 'footer',
	label: 'Footer',
	group: 'Layout',
	description: 'The "Contact me" block at the bottom of pages, plus the legal links line.',
	fields: [
		group(
			'cta',
			[
				textarea('title', { admin: { description: 'A line break in the text becomes a line break on the page.' } }),
				text('titleAccent', { admin: { description: 'Words at the end of the title drawn in the accent color.' } }),
				textarea('body'),
				link('primaryCta', 'Primary button', false),
				text('secondaryCtaLabel', { admin: { description: 'Label of the button that opens the Cal.com booking page.' } }),
				{ name: 'terminalPrompt', type: 'text', admin: { description: 'Command shown at the top of the terminal card.' } },
				{
					name: 'terminalRows',
					type: 'array',
					fields: [
						{
							type: 'row',
							fields: [
								{ name: 'key', type: 'text', required: true },
								text('value', { required: true }),
								{ name: 'href', type: 'text' },
								{ name: 'live', type: 'checkbox', admin: { description: 'Adds the green live dot.' } }
							]
						}
					]
				}
			],
			{ label: 'Contact block', admin: { description: 'Shown above the footer on every page except Contact, errors and the legal pages.' } }
		),
		text('copyright'),
		text('label', { required: true, admin: { description: 'V6 only, not shown since V7.' } }),
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
