import { link, sectionHeader, text, textarea } from '../fields'
import { defineGlobal } from './define'

export const Resume = defineGlobal({
	slug: 'resume',
	label: 'Resume page',
	group: 'Pages',
	previewPath: '/resume',
	fields: [
		{
			type: 'tabs',
			tabs: [
				{
					label: 'Header',
					fields: [
						text('label', { required: true }),
						text('name', { required: true }),
						text('subtitle', { required: true }),
						textarea('bio', { required: true }),
						{ name: 'portrait', type: 'upload', relationTo: 'media' },
						{
							name: 'cv',
							type: 'upload',
							relationTo: 'media',
							admin: { description: 'The PDF served at /cv.pdf. Upload a new file here to replace it everywhere.' }
						},
						text('downloadLabel', { required: true }),
						link('hireCta', 'Hire button')
					]
				},
				{
					label: 'Impact',
					fields: [
						{
							name: 'impact',
							type: 'array',
							maxRows: 4,
							fields: [
								text('label', { required: true }),
								text('value', { required: true }),
								text('sub'),
								{
									name: 'style',
									type: 'select',
									defaultValue: 'number',
									options: [
										{ label: 'Large number', value: 'number' },
										{ label: 'Monospace text', value: 'text' },
										{ label: 'Monospace accent', value: 'accent' }
									]
								}
							]
						}
					]
				},
				{
					label: 'Sections',
					fields: [
						sectionHeader('experience', 'Experience'),
						sectionHeader('ownProduct', 'Own product'),
						sectionHeader('leadership', 'Leadership & teaching'),
						sectionHeader('education', 'Education', false),
						sectionHeader('skills', 'Skills')
					]
				},
				{
					label: 'Skills',
					fields: [
						{
							name: 'skillGroups',
							type: 'array',
							fields: [
								text('title', { required: true }),
								{
									name: 'skills',
									type: 'array',
									fields: [
										{
											type: 'row',
											fields: [
												{ name: 'name', type: 'text', required: true },
												{ name: 'primary', type: 'checkbox', admin: { description: 'Daily tool, gets the accent dot.' } }
											]
										}
									]
								}
							]
						}
					]
				}
			]
		}
	]
})
