import { BlocksFeature, CodeBlock, FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Block, Field } from 'payload'
import { CODE_LANGUAGES, renderedHtmlHook } from './render'

const code = CodeBlock({ defaultLanguage: 'typescript', languages: { ...CODE_LANGUAGES } })

/** The window label above the code; the language is shown when it is empty. */
const codeWithFilename: Block = {
	...code,
	fields: [
		...code.fields,
		{
			name: 'filename',
			type: 'text',
			label: 'File name',
			admin: { description: 'Shown in the code header, e.g. ~/traefik/.env. Leave empty to show the language.' }
		}
	]
}

export const editor = lexicalEditor({
	features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature(), BlocksFeature({ blocks: [codeWithFilename] })]
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
