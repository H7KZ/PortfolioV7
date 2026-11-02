import type { Field, GroupField, TextareaField, TextField } from 'payload'

export function text(name: string, options: Partial<TextField> = {}): TextField {
	return { name, type: 'text', localized: true, ...options } as TextField
}

export function textarea(name: string, options: Partial<TextareaField> = {}): TextareaField {
	return { name, type: 'textarea', localized: true, ...options } as TextareaField
}

export function group(name: string, fields: Field[], options: Partial<GroupField> = {}): GroupField {
	return { name, type: 'group', fields, ...options } as GroupField
}

export function sectionHeader(name: string, label?: string, withSub = true): GroupField {
	return group(name, [text('label', { required: true }), text('heading', { required: true }), ...(withSub ? [textarea('sub')] : [])], { label })
}

export function link(name: string, label?: string, required = true): GroupField {
	return group(name, [text('label', { required }), text('href', { required, localized: false })], { label })
}

export const chips: Field = {
	name: 'chips',
	type: 'text',
	hasMany: true
}

export const order: Field = {
	name: 'order',
	type: 'number',
	defaultValue: 99,
	admin: { position: 'sidebar', description: 'Lower numbers come first.' }
}

export const slug: Field = {
	name: 'slug',
	type: 'text',
	required: true,
	unique: true,
	index: true,
	admin: { position: 'sidebar', description: 'URL segment. Changing it breaks existing links unless you add a redirect.' }
}
