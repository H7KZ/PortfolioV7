import type { Field, GlobalConfig } from 'payload'
import { canReadContent, isAdmin } from '../access'
import { revalidateGlobalAfterChange } from '../hooks/revalidate'
import { previewUrl } from '../preview'

interface Options {
	slug: string
	label: string
	group: 'Pages' | 'Layout' | 'Settings'
	fields: Field[]
	description?: string
	previewPath?: string
}

export function defineGlobal({ slug, label, group, fields, description, previewPath }: Options): GlobalConfig {
	return {
		slug,
		label,
		admin: {
			group,
			description,
			preview: previewPath ? (_doc, { locale }) => previewUrl(previewPath, locale) : undefined
		},
		versions: previewPath ? { drafts: true, max: 25 } : { max: 25 },
		access: { read: canReadContent, update: isAdmin },
		hooks: { afterChange: [revalidateGlobalAfterChange] },
		fields
	}
}
