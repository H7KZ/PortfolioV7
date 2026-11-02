import { text } from '../fields'
import { defineGlobal } from './define'

export const Errors = defineGlobal({
	slug: 'errors',
	label: 'Error pages',
	group: 'Pages',
	fields: [
		text('backLabel', { required: true }),
		text('codeLabel', { admin: { description: 'Small status line, {status} becomes the HTTP status code.' } }),
		text('fallbackMessage', { required: true }),
		{
			name: 'messages',
			type: 'array',
			fields: [
				{
					type: 'row',
					fields: [{ name: 'status', type: 'number', required: true }, text('title', { required: true }), text('message', { required: true })]
				}
			]
		},
		{
			name: 'suggestions',
			type: 'array',
			admin: { description: 'Links on the 404 page.' },
			fields: [
				{
					type: 'row',
					fields: [
						{ name: 'icon', type: 'text', required: true },
						text('label', { required: true }),
						text('sub'),
						{ name: 'href', type: 'text', required: true }
					]
				}
			]
		}
	]
})
