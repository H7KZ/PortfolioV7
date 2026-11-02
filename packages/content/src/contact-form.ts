import { z } from 'zod'
import type { ContactForm } from './payload-types'

export const SINGLE_SELECTS = ['projectType', 'hosting', 'support', 'priority'] as const
export const MULTI_SELECTS = ['features', 'technologies', 'assets', 'audiences', 'legals'] as const

export const MESSAGE_MIN_LENGTH = 20
export const MESSAGE_MAX_LENGTH = 5000

export type SingleSelect = (typeof SINGLE_SELECTS)[number]
export type MultiSelect = (typeof MULTI_SELECTS)[number]

export interface ContactFormValues {
	fullName: string
	email: string
	company: string
	message: string
	budget: string
	projectType: string
	features: string[]
	technologies: string[]
	assets: string[]
	audiences: string[]
	hosting: string
	support: string
	legals: string[]
	deadline: string
	priority: string
}

export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>

export type ContactFormConfig = Omit<ContactForm, 'id' | 'updatedAt' | 'createdAt'>

export function initialContactValues(): ContactFormValues {
	return {
		fullName: '',
		email: '',
		company: '',
		message: '',
		budget: '',
		projectType: '',
		features: [],
		technologies: [],
		assets: [],
		audiences: [],
		hosting: '',
		support: '',
		legals: [],
		deadline: '',
		priority: ''
	}
}

function optionKeys(config: ContactFormConfig, field: SingleSelect | MultiSelect): string[] {
	return (config[field].options ?? []).map(option => option.key)
}

export function buildContactSchema(config: ContactFormConfig) {
	const messages = config.validation
	const tooLong = (max: number) => messages.tooLong.replace('{max}', String(max))
	const single = (field: SingleSelect) =>
		z
			.string()
			.max(50, tooLong(50))
			.refine(value => value === '' || optionKeys(config, field).includes(value), messages.invalidOption)
	const multi = (field: MultiSelect) =>
		z
			.array(z.string().max(50, tooLong(50)))
			.max(20, tooLong(20))
			.refine(values => values.every(value => optionKeys(config, field).includes(value)), messages.invalidOption)

	return z.object({
		fullName: z.string().trim().min(1, messages.required).max(100, tooLong(100)),
		email: z.string().trim().min(1, messages.required).max(254, tooLong(254)).pipe(z.email(messages.invalidEmail)),
		company: z.string().trim().max(100, tooLong(100)),
		message: z
			.string()
			.trim()
			.min(1, messages.required)
			.min(MESSAGE_MIN_LENGTH, messages.tooShort ?? messages.required)
			.max(MESSAGE_MAX_LENGTH, tooLong(MESSAGE_MAX_LENGTH)),
		budget: z
			.string()
			.max(50, tooLong(50))
			.refine(value => value === '' || (config.budget.options ?? []).some(option => option.key === value), messages.invalidOption),
		projectType: single('projectType'),
		features: multi('features'),
		technologies: multi('technologies'),
		assets: multi('assets'),
		audiences: multi('audiences'),
		hosting: single('hosting'),
		support: single('support'),
		legals: multi('legals'),
		deadline: z.string().refine(value => value === '' || !Number.isNaN(Date.parse(value)), messages.invalidDate),
		priority: single('priority')
	})
}

export function contactFieldErrors(error: z.ZodError): ContactFormErrors {
	const errors: ContactFormErrors = {}
	for (const issue of error.issues) {
		const field = issue.path[0] as keyof ContactFormValues | undefined
		if (field && !errors[field]) errors[field] = issue.message
	}
	return errors
}

/** The optional selections as the labels the visitor saw, so a stored submission stays readable after options change. */
export function describeSelections(values: ContactFormValues, config: ContactFormConfig): Record<string, string | string[]> {
	const label = (field: SingleSelect | MultiSelect, key: string): string => config[field].options?.find(option => option.key === key)?.label ?? key
	const details: Record<string, string | string[]> = {}

	for (const field of SINGLE_SELECTS) {
		if (values[field]) details[config[field].label] = label(field, values[field])
	}
	for (const field of MULTI_SELECTS) {
		if (values[field].length > 0) details[config[field].label] = values[field].map(key => label(field, key))
	}
	return details
}
