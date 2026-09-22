import { text, textarea } from '../fields'
import { defineGlobal } from './define'

export const Contact = defineGlobal({
	slug: 'contact',
	label: 'Contact page',
	group: 'Pages',
	fields: [
		text('label', { required: true }),
		text('heading', { required: true }),
		textarea('intro', { required: true }),
		{
			type: 'row',
			fields: [text('emailLabel', { required: true }), text('linkedinLabel', { required: true }), text('linkedinSub')]
		},
		{ type: 'row', fields: [text('bookCallLabel', { required: true }), text('bookCallSub')] },
		text('includeLabel', { required: true }),
		textarea('includeText', { required: true }),
		{ type: 'row', fields: [text('briefTitle', { required: true }), text('briefStep')] },
		text('skipFormLabel', { required: true }),
		textarea('skipFormText', { required: true })
	]
})
