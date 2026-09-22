import type { CollectionConfig } from 'payload'
import { canReadContent, isAdmin } from '../access'
import { slug, text, textarea } from '../fields'
import { revalidateCollectionAfterChange, revalidateCollectionAfterDelete } from '../hooks/revalidate'
import { previewUrl } from '../preview'
import { richTextWithHtml } from '../rich-text/fields'

const WORDS_PER_MINUTE = 200

interface TextNode {
	text?: string
	fields?: { code?: string }
	children?: TextNode[]
	root?: TextNode
}

function countWords(node: TextNode | undefined): number {
	if (!node) return 0
	const own = `${node.text ?? ''} ${node.fields?.code ?? ''}`.split(/\s+/).filter(Boolean).length
	return own + countWords(node.root) + (node.children ?? []).reduce((sum, child) => sum + countWords(child), 0)
}

export const Posts: CollectionConfig = {
	slug: 'posts',
	admin: {
		group: 'Content',
		useAsTitle: 'title',
		defaultColumns: ['title', 'slug', 'date', '_status'],
		preview: (doc, { locale }) => previewUrl(`/blog/${doc.slug as string}`, locale)
	},
	versions: { drafts: true, maxPerDoc: 25 },
	access: {
		read: canReadContent,
		create: isAdmin,
		update: isAdmin,
		delete: isAdmin
	},
	defaultSort: '-date',
	hooks: {
		beforeChange: [
			({ data }) => {
				if (!data.readingTime && data.content) {
					data.readingTime = Math.max(1, Math.round(countWords(data.content) / WORDS_PER_MINUTE))
				}
				return data
			}
		],
		afterChange: [revalidateCollectionAfterChange],
		afterDelete: [revalidateCollectionAfterDelete]
	},
	fields: [
		slug,
		{ name: 'date', type: 'date', required: true, admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } } },
		{ name: 'author', type: 'text', defaultValue: 'Jan Komínek', admin: { position: 'sidebar' } },
		{
			name: 'readingTime',
			type: 'number',
			admin: { position: 'sidebar', description: 'Minutes. Leave empty to calculate from the text.' }
		},
		text('title', { required: true }),
		textarea('description'),
		{ name: 'tags', type: 'text', hasMany: true },
		{ name: 'thumbnail', type: 'upload', relationTo: 'media' },
		...richTextWithHtml('content'),
		{
			name: 'legacyMarkdown',
			type: 'textarea',
			admin: {
				readOnly: true,
				description: 'Original V6 markdown, kept so nothing from the old site is lost. Not shown on the website.',
				condition: data => Boolean(data?.legacyMarkdown)
			}
		}
	]
}
