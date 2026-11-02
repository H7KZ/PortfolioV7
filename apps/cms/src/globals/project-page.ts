import { text } from '../fields'
import { defineGlobal } from './define'

export const ProjectPage = defineGlobal({
	slug: 'project-page',
	label: 'Project page labels',
	group: 'Pages',
	description: 'Labels shared by every project page.',
	fields: [
		text('backLabel', { required: true }),
		text('caseStudyLabel', { required: true }),
		{
			type: 'row',
			fields: [
				text('roleLabel', { required: true }),
				text('teamLabel', { required: true }),
				text('timelineLabel', { required: true }),
				text('sectorLabel', { required: true })
			]
		},
		{
			type: 'row',
			fields: [text('challengeLabel', { required: true }), text('contributionsLabel', { required: true }), text('stackLabel', { required: true })]
		},
		{
			type: 'row',
			fields: [text('architectureLabel'), text('nextLabel'), text('placeholderLabel'), text('placeholderSuffix')]
		},
		text('metaSuffix', { admin: { description: 'Appended to meta descriptions, e.g. "A project by Jan Komínek, Fullstack Engineer."' } })
	]
})
