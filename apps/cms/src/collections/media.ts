import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CollectionConfig } from 'payload'
import { canReadContent, isAdmin } from '../access'
import { config } from '../config'
import { revalidateCollectionAfterChange, revalidateCollectionAfterDelete } from '../hooks/revalidate'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Media: CollectionConfig = {
	slug: 'media',
	admin: {
		group: 'Content',
		useAsTitle: 'filename',
		description: 'Images and files. Served on the website at /media/<filename>.'
	},
	access: {
		read: canReadContent,
		create: isAdmin,
		update: isAdmin,
		delete: isAdmin
	},
	upload: {
		staticDir: config.mediaDir || path.resolve(dirname, '../../media'),
		mimeTypes: ['image/*', 'application/pdf']
	},
	hooks: {
		afterChange: [revalidateCollectionAfterChange],
		afterDelete: [revalidateCollectionAfterDelete]
	},
	fields: [
		{
			name: 'alt',
			type: 'text',
			localized: true,
			admin: { description: 'Describes the image for screen readers and search engines.' }
		},
		{
			name: 'formats',
			type: 'json',
			admin: {
				readOnly: true,
				description: 'Other encodings of this image (AVIF, 800 px wide) uploaded alongside it. The site offers them to browsers that support them.'
			}
		},
		{
			name: 'legacyPath',
			type: 'text',
			index: true,
			admin: { readOnly: true, position: 'sidebar', description: 'Path this file had on the V6 site. Old links redirect here.' }
		}
	]
}
