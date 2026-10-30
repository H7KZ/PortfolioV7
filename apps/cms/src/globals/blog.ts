import { text, textarea } from '../fields'
import { defineGlobal } from './define'

export const Blog = defineGlobal({
	slug: 'blog',
	label: 'Blog page',
	group: 'Pages',
	fields: [
		{
			type: 'tabs',
			tabs: [
				{
					label: 'Index',
					fields: [
						text('label', { required: true }),
						text('heading', { required: true }),
						textarea('lead'),
						text('readLabel', { admin: { description: 'Link label on each post card.' } }),
						{ type: 'row', fields: [text('draftingLabel'), textarea('nextUpText')] },
						text('minutesShort', { required: true, admin: { description: 'After the reading time in the list, e.g. MIN' } })
					]
				},
				{
					label: 'Post',
					fields: [
						text('backLabel', { admin: { description: 'Link above the post title that returns to the blog list, e.g. All posts.' } }),
						text('tocLabel', { admin: { description: 'Heading of the contents box beside a post, e.g. On this page.' } }),
						text('minutesLong', { required: true, admin: { description: 'After the reading time on a post, e.g. min read' } }),
						text('shareLabel', { required: true }),
						textarea('shareText', { required: true }),
						text('shareOnXLabel', { required: true }),
						text('rssLabel', { required: true })
					]
				},
				{
					label: 'RSS feed',
					fields: [text('feedTitle', { required: true }), textarea('feedDescription', { required: true })]
				}
			]
		}
	]
})
