import type { CollectionConfig } from 'payload'
import { canSubmitContact, isAdmin } from '../access'
import { notifyDiscord } from '../hooks/notify-discord'

export const CONTACT_RETENTION_MONTHS = 12

export const ContactSubmissions: CollectionConfig = {
	slug: 'contact-submissions',
	admin: {
		group: 'Inbox',
		useAsTitle: 'fullName',
		defaultColumns: ['fullName', 'company', 'email', 'createdAt'],
		description: `Messages from the contact form. Deleted automatically after ${CONTACT_RETENTION_MONTHS} months.`
	},
	access: {
		create: canSubmitContact,
		read: isAdmin,
		// A submission is a record of what the visitor sent; nobody edits it.
		update: () => false,
		delete: isAdmin
	},
	defaultSort: '-createdAt',
	hooks: {
		afterChange: [notifyDiscord]
	},
	fields: [
		{
			type: 'row',
			fields: [
				{ name: 'fullName', type: 'text', required: true },
				{ name: 'email', type: 'email', required: true }
			]
		},
		{
			type: 'row',
			fields: [
				{ name: 'company', type: 'text' },
				{ name: 'budget', type: 'number' }
			]
		},
		{ name: 'message', type: 'textarea', required: true },
		{
			name: 'details',
			type: 'json',
			admin: { description: 'Optional project details, as the labels the visitor saw.' }
		},
		{ name: 'deadline', type: 'date' },
		{ name: 'locale', type: 'text', admin: { position: 'sidebar' } }
	]
}
