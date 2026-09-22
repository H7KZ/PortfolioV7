import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { ContactSubmissions } from './collections/contact-submissions'
import { Experience } from './collections/experience'
import { Media } from './collections/media'
import { Posts } from './collections/posts'
import { Projects } from './collections/projects'
import { Redirects } from './collections/redirects'
import { Services } from './collections/services'
import { Testimonials } from './collections/testimonials'
import { Users } from './collections/users'
import { config } from './config'
import { Blog } from './globals/blog'
import { Contact } from './globals/contact'
import { ContactForm } from './globals/contact-form'
import { Errors } from './globals/errors'
import { Footer } from './globals/footer'
import { Home } from './globals/home'
import { Privacy, Terms } from './globals/legal'
import { Navigation } from './globals/navigation'
import { ProjectPage } from './globals/project-page'
import { Resume } from './globals/resume'
import { Site } from './globals/site'
import { purgeContactSubmissions } from './jobs/purge-contact-submissions'
import { migrations } from './migrations'
import { editor } from './rich-text/fields'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
	serverURL: config.cmsUrl,
	secret: config.payloadSecret,
	admin: {
		user: Users.slug,
		meta: { titleSuffix: ' · Portfolio CMS' },
		importMap: { baseDir: path.resolve(dirname) },
		dateFormat: 'd. M. yyyy'
	},
	localization: {
		locales: [
			{ code: 'en', label: 'English' },
			{ code: 'cs', label: 'Čeština' }
		],
		defaultLocale: 'en',
		fallback: true
	},
	collections: [Projects, Posts, Experience, Testimonials, Services, Media, ContactSubmissions, Redirects, Users],
	globals: [Home, Resume, Blog, Contact, ProjectPage, Privacy, Terms, Errors, Navigation, Footer, Site, ContactForm],
	editor,
	graphQL: { disable: true },
	db: postgresAdapter({
		pool: { connectionString: config.databaseUri },
		migrationDir: path.resolve(dirname, 'migrations'),
		prodMigrations: migrations,
		push: false
	}),
	sharp,
	typescript: {
		outputFile: path.resolve(dirname, '../../../packages/content/src/payload-types.ts'),
		declare: false
	},
	telemetry: false,
	jobs: {
		tasks: [purgeContactSubmissions],
		autoRun: [{ cron: '*/30 * * * *', queue: 'nightly', limit: 10 }],
		shouldAutoRun: () => process.env.PAYLOAD_DISABLE_JOBS !== '1',
		jobsCollectionOverrides: ({ defaultJobsCollection }) => ({
			...defaultJobsCollection,
			admin: { ...defaultJobsCollection.admin, hidden: true }
		})
	},
	plugins: [
		seoPlugin({
			collections: ['projects', 'posts'],
			globals: ['home', 'resume', 'blog', 'contact', 'privacy', 'terms'],
			uploadsCollection: 'media',
			tabbedUI: false,
			generateTitle: ({ doc }) => (doc?.title ? `${doc.title as string} · Jan Komínek` : 'Jan Komínek'),
			generateDescription: ({ doc }) => (doc?.lede as string | undefined) ?? (doc?.description as string | undefined) ?? ''
		})
	]
})
