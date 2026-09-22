import { BlocksFeature, CodeBlock, FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Field } from 'payload'
import { CODE_LANGUAGES, renderedHtmlHook } from './render'

export const editor = lexicalEditor({
	features: ({ defaultFeatures }) => [
		...defaultFeatures,
		FixedToolbarFeature(),
		BlocksFeature({ blocks: [CodeBlock({ defaultLanguage: 'typescript', languages: { ...CODE_LANGUAGES } })] })
	]
})

export function richTextWithHtml(name: string, options: { required?: boolean; label?: string } = {}): Field[] {
	return [
		{
			name,
			type: 'richText',
			localized: true,
			editor,
			required: options.required,
			label: options.label
		},
		{
			name: `${name}Html`,
			type: 'textarea',
			localized: true,
			admin: { hidden: true },
			hooks: { beforeChange: [renderedHtmlHook(name)] }
		}
	]
}
