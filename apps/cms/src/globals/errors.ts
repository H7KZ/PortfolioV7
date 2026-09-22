import { text } from '../fields'
import { defineGlobal } from './define'

export const Errors = defineGlobal({
	slug: 'errors',
	label: 'Error pages',
	group: 'Pages',
	fields: [
		text('backLabel', { required: true }),
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
		}
	]
})
