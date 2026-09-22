import { convertLexicalToHTML, type HTMLConvertersFunction } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { FieldHook, PayloadRequest } from 'payload'
import { createHighlighter, type Highlighter } from 'shiki'
import { smartypants } from './smartypants'

export const CODE_LANGUAGES = {
	plaintext: 'Plain Text',
	bash: 'Bash',
	csharp: 'C#',
	css: 'CSS',
	dotenv: 'dotenv',
	html: 'HTML',
	java: 'Java',
	javascript: 'JavaScript',
	json: 'JSON',
	rust: 'Rust',
	sql: 'SQL',
	toml: 'TOML',
	typescript: 'TypeScript',
	vue: 'Vue',
	yaml: 'YAML'
} as const

const CODE_FORMAT = 16

interface LexicalNode {
	type: string
	text?: string
	format?: number
	children?: LexicalNode[]
	relationTo?: string
	value?: unknown
	fields?: Record<string, unknown>
}

let highlighter: Promise<Highlighter> | undefined

function getHighlighter(): Promise<Highlighter> {
	highlighter ??= createHighlighter({ themes: ['monokai'], langs: Object.keys(CODE_LANGUAGES).filter(lang => lang !== 'plaintext') })
	return highlighter
}

function escapeHtml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function walk(node: LexicalNode, visit: (node: LexicalNode) => void): void {
	visit(node)
	node.children?.forEach(child => walk(child, visit))
}

async function prepare(state: SerializedEditorState, req: PayloadRequest): Promise<SerializedEditorState> {
	const copy = structuredClone(state) as unknown as { root: LexicalNode }
	const shiki = await getHighlighter()
	const pending: Promise<void>[] = []
	let previousText = ' '

	walk(copy.root, node => {
		if (node.type === 'text' && typeof node.text === 'string' && !((node.format ?? 0) & CODE_FORMAT)) {
			node.text = smartypants(node.text, previousText.slice(-1))
			previousText = node.text
			return
		}

		if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'listitem') previousText = ' '

		if (node.type === 'block' && node.fields?.blockType === 'Code') {
			const language = String(node.fields.language ?? 'plaintext')
			const code = String(node.fields.code ?? '')
			const lang = language in CODE_LANGUAGES && language !== 'plaintext' ? language : 'text'
			node.fields.html = shiki.codeToHtml(code, { lang, theme: 'monokai' })
			return
		}

		if (node.type === 'upload' && node.relationTo === 'media') {
			pending.push(
				(async () => {
					const id = typeof node.value === 'object' && node.value !== null ? (node.value as { id: number }).id : node.value
					const media = await req.payload.findByID({ collection: 'media', id: id as number, depth: 0, req, disableErrors: true })
					node.value = media ?? null
				})()
			)
		}
	})

	await Promise.all(pending)
	return copy as unknown as SerializedEditorState
}

const converters: HTMLConvertersFunction = ({ defaultConverters }) => ({
	...defaultConverters,
	blocks: {
		Code: ({ node }: { node: unknown }) => String((node as LexicalNode).fields?.html ?? '')
	},
	upload: ({ node }: { node: unknown }) => {
		const media = (node as LexicalNode).value as { filename?: string; alt?: string; mimeType?: string } | null
		if (!media?.filename) return ''
		const src = `/media/${encodeURIComponent(media.filename)}`
		if (!media.mimeType?.startsWith('image/')) return `<p><a href="${src}" target="_blank" rel="noopener">${escapeHtml(media.filename)}</a></p>`
		return `<div class="flex justify-center items-center mb-16"><img src="${src}" alt="${escapeHtml(media.alt ?? '')}" class="w-3/4 object-cover" /></div>`
	}
})

export async function renderRichText(state: SerializedEditorState | null | undefined, req: PayloadRequest): Promise<string> {
	if (!state?.root) return ''
	const prepared = await prepare(state, req)
	return convertLexicalToHTML({ converters, data: prepared, disableContainer: true })
}

export function renderedHtmlHook(sourceField: string): FieldHook {
	return async ({ siblingData, req }) => renderRichText(siblingData[sourceField] as SerializedEditorState | undefined, req)
}
