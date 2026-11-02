import { text } from '../fields'
import { richTextWithHtml } from '../rich-text/fields'
import { defineGlobal } from './define'

export const Privacy = defineGlobal({
	slug: 'privacy',
	label: 'Privacy policy',
	group: 'Pages',
	previewPath: '/privacy',
	fields: [
		text('label', { required: true }),
		text('title', { required: true }),
		{ name: 'updatedAt', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
		text('updatedLabel', { required: true }),
		text('bindingNote'),
		text('tocLabel', { admin: { description: 'Heading of the contents box beside the text, e.g. On this page.' } }),
		...richTextWithHtml('content', { required: true }),
		{
			type: 'collapsible',
			label: 'Analytics opt-out box',
			fields: [
				text('optOutTitle', { required: true }),
				text('optOutActive', { required: true, admin: { description: 'Shown while this browser is counted.' } }),
				text('optOutInactive', { required: true, admin: { description: 'Shown after opting out.' } }),
				text('optOutButton', { required: true }),
				text('optInButton', { required: true })
			]
		}
	]
})

export const Terms = defineGlobal({
	slug: 'terms',
	label: 'Terms of use',
	group: 'Pages',
	previewPath: '/terms',
	fields: [
		text('label', { required: true }),
		text('title', { required: true }),
		{ name: 'updatedAt', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
		text('updatedLabel', { required: true }),
		text('bindingNote'),
		text('tocLabel', { admin: { description: 'Heading of the contents box beside the text, e.g. On this page.' } }),
		...richTextWithHtml('content', { required: true })
	]
})
