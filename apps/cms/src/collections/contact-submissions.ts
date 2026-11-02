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
				{ name: 'budgetRange', type: 'text', admin: { description: 'Key of the budget option the visitor picked.' } },
				{ name: 'budget', type: 'number', admin: { description: 'V6 slider value, kept for older submissions.' } }
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
