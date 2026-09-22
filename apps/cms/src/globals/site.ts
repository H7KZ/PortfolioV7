import { text, textarea } from '../fields'
import { defineGlobal } from './define'

export const Site = defineGlobal({
	slug: 'site',
	label: 'Site settings',
	group: 'Settings',
	description: 'Identity, contact details, structured data for search engines and default SEO.',
	fields: [
		{
			type: 'tabs',
			tabs: [
				{
					label: 'Identity',
					fields: [
						{ name: 'name', type: 'text', required: true },
						{ name: 'alternateName', type: 'text' },
						{ name: 'siteUrl', type: 'text', required: true, admin: { description: 'Canonical origin, e.g. https://jankominek.com' } },
						{ name: 'email', type: 'email', required: true },
						{ name: 'linkedinUrl', type: 'text', required: true },
						{ name: 'calLink', type: 'text', required: true, admin: { description: 'Cal.com event, e.g. jankominek/30min' } },
						text('skipToContent', { required: true, admin: { description: 'Screen-reader link at the top of every page.' } })
					]
				},
				{
					label: 'Default SEO',
					fields: [
						text('title', { required: true }),
						textarea('description', { required: true }),
						{ name: 'keywords', type: 'text' },
						{ name: 'image', type: 'upload', relationTo: 'media' },
						text('imageAlt'),
						{ name: 'twitterHandle', type: 'text', admin: { description: 'Used in the blog "Share on X" link, e.g. @jankominek' } }
					]
				},
				{
					label: 'Structured data',
					fields: [
						text('jobTitle', { required: true }),
						textarea('personDescription', { required: true }),
						textarea('profileDescription'),
						{ name: 'portrait', type: 'upload', relationTo: 'media' },
						{
							type: 'row',
							fields: [
								{ name: 'locality', type: 'text' },
								{ name: 'country', type: 'text' }
							]
						},
						{ name: 'sameAs', type: 'text', hasMany: true, admin: { description: 'Profile URLs (LinkedIn, GitHub, ...)' } },
						{ name: 'knowsAbout', type: 'text', hasMany: true },
						{ name: 'occupationSkills', type: 'text' },
						{
							name: 'alumniOf',
							type: 'array',
							fields: [
								{
									type: 'row',
									fields: [
										{ name: 'name', type: 'text', required: true },
										{ name: 'alternateName', type: 'text' }
									]
								}
							]
						},
						text('offerCatalogName'),
						{ name: 'services', type: 'array', fields: [text('name', { required: true })] }
					]
				},
				{
					label: 'Text files',
					fields: [
						{
							name: 'humansTxt',
							type: 'textarea',
							admin: { description: 'Served at /humans.txt' }
						},
						{
							name: 'llmsTxt',
							type: 'textarea',
							admin: { description: 'Served at /llms.txt' }
						},
						{
							name: 'llmsFullTxt',
							type: 'textarea',
							admin: { description: 'Served at /llms-full.txt' }
						}
					]
				}
			]
		}
	]
})
