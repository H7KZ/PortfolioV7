import type { Field } from 'payload'
import { group, text } from '../fields'
import { defineGlobal } from './define'

function input(name: string, label: string): Field {
	return group(name, [{ type: 'row', fields: [text('label', { required: true }), text('placeholder')] }], { label })
}

const options: Field = {
	name: 'options',
	type: 'array',
	admin: { description: 'The key is stored with each submission and must stay stable; the label is what visitors see.' },
	fields: [
		{
			type: 'row',
			fields: [{ name: 'key', type: 'text', required: true }, text('label', { required: true })]
		}
	]
}

function select(name: string, label: string): Field {
	return group(name, [{ type: 'row', fields: [text('label', { required: true }), text('emptyOption', { required: true })] }, options], {
		label,
		admin: { description: 'Single choice.' }
	})
}

function multiSelect(name: string, label: string): Field {
	return group(name, [{ type: 'row', fields: [text('label', { required: true }), text('placeholder')] }, options], {
		label,
		admin: { description: 'Multiple choice.' }
	})
}

export const ContactForm = defineGlobal({
	slug: 'contact-form',
	label: 'Contact form',
	group: 'Settings',
	fields: [
		{
			type: 'tabs',
			tabs: [
				{
					label: 'Main fields',
					fields: [
						input('fullName', 'Full name'),
						input('email', 'Email'),
						input('message', 'Message'),
						group(
							'budget',
							[
								text('label', { required: true }),
								{
									type: 'row',
									fields: [
										{ name: 'currency', type: 'text', required: true, defaultValue: '€' },
										{ name: 'min', type: 'number', required: true, defaultValue: 1000 },
										{ name: 'max', type: 'number', required: true, defaultValue: 25000 },
										{ name: 'step', type: 'number', required: true, defaultValue: 250 },
										{ name: 'default', type: 'number', required: true, defaultValue: 2500 }
									]
								}
							],
							{ label: 'Budget slider' }
						),
						text('advancedLabel', { required: true, admin: { description: 'Title of the collapsible section below.' } })
					]
				},
				{
					label: 'More information',
					fields: [
						input('company', 'Company'),
						select('projectType', 'Project type'),
						multiSelect('features', 'Features'),
						multiSelect('technologies', 'Technologies'),
						multiSelect('assets', 'Assets'),
						multiSelect('audiences', 'Audiences'),
						select('hosting', 'Hosting'),
						select('support', 'Support'),
						multiSelect('legals', 'Legal'),
						group('deadline', [text('label', { required: true })], { label: 'Deadline' }),
						select('priority', 'Priority')
					]
				},
				{
					label: 'Messages',
					fields: [
						{ type: 'row', fields: [text('sendLabel', { required: true }), text('sendingLabel', { required: true })] },
						text('successMessage', { required: true }),
						text('errorMessage', { required: true }),
						group(
							'validation',
							[
								text('required', { required: true }),
								text('invalidEmail', { required: true }),
								text('tooLong', { required: true }),
								text('invalidOption', { required: true }),
								text('invalidDate', { required: true }),
								text('budgetRange', { required: true })
							],
							{ label: 'Validation messages' }
						)
					]
				}
			]
		}
	]
})
