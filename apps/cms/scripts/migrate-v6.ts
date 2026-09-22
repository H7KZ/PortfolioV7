/**
 * One-shot import of the V6 SvelteKit portfolio into Payload.
 *
 *   V6_DIR=../../../PortfolioV6 pnpm migrate:v6
 *
 * Idempotent: documents with a natural key (slug, legacy path, redirect source) are upserted, and
 * the keyless collections (experience, testimonials, services) are replaced wholesale. English is
 * written first and Czech second, reusing the English array row ids so localized sub-fields pair up.
 */
import { randomBytes } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import matter from 'gray-matter'
import { getPayload, type Payload } from 'payload'
import config from '../src/payload.config'
import {
	EXPERIENCE,
	GEO_SUMMARY,
	HOME_CARDS,
	HTTP_STATUS_TITLES,
	PERSON,
	RESUME_IMPACT,
	SEO,
	SERVICE_CHIPS,
	SKILL_GROUPS,
	TESTIMONIAL_LINK,
	TESTIMONIALS
} from './v6/constants'
import { privacyMarkdown, termsMarkdown } from './v6/legal'

type Locale = 'en' | 'cs'
type Json = Record<string, unknown>

const dirname = path.dirname(fileURLToPath(import.meta.url))
const V6 = path.resolve(process.env.V6_DIR ?? path.join(dirname, '../../../../PortfolioV6'))
const LOCALES: Locale[] = ['en', 'cs']

const MIME: Record<string, string> = {
	'.webp': 'image/webp',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.svg': 'image/svg+xml',
	'.pdf': 'application/pdf'
}

const payload: Payload = await getPayload({ config })
const editorConfig = await editorConfigFactory.default({ config: payload.config })
const strings: Record<Locale, Json> = {
	en: JSON.parse(await fs.readFile(path.join(V6, 'src/locales/en.json'), 'utf8')),
	cs: JSON.parse(await fs.readFile(path.join(V6, 'src/locales/cs.json'), 'utf8'))
}
const mediaByLegacyPath = new Map<string, { id: number; filename: string }>()

function log(message: string): void {
	console.log(`migrate-v6: ${message}`)
}

function t(locale: Locale, key: string): string {
	const value = key.split('.').reduce<unknown>((node, part) => (node as Json | undefined)?.[part], strings[locale])
	if (typeof value !== 'string') throw new Error(`Missing ${locale} string ${key}`)
	return value
}

function isObject(value: unknown): value is Json {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Copies array row ids from the stored English document onto the Czech payload, so rows pair up by index. */
function withRowIds(stored: unknown, next: unknown): unknown {
	if (Array.isArray(next) && Array.isArray(stored)) {
		return next.map((row, index) => {
			const storedRow = stored[index]
			if (!isObject(row) || !isObject(storedRow)) return row
			return { ...(withRowIds(storedRow, row) as Json), id: storedRow.id }
		})
	}
	if (isObject(next) && isObject(stored)) {
		return Object.fromEntries(Object.entries(next).map(([key, value]) => [key, withRowIds(stored[key], value)]))
	}
	return next
}

function objectId(): string {
	return randomBytes(12).toString('hex')
}

function stripHtmlTags(value: string): string {
	return value.replace(/<strong>(.*?)<\/strong>/g, '**$1**').replace(/<[^>]+>/g, '')
}

// ---------------------------------------------------------------------------------------------- media

async function listFiles(directory: string): Promise<string[]> {
	const entries = await fs.readdir(directory, { withFileTypes: true })
	const nested = await Promise.all(
		entries.map(entry => (entry.isDirectory() ? listFiles(path.join(directory, entry.name)) : Promise.resolve([path.join(directory, entry.name)])))
	)
	return nested.flat()
}

function mediaFilename(legacyPath: string): string {
	return legacyPath.replace(/^\/(images|files)\//, '').replace(/\//g, '-')
}

async function importMedia(): Promise<void> {
	const staticDir = path.join(V6, 'static')
	const files = [...(await listFiles(path.join(staticDir, 'images'))), ...(await listFiles(path.join(staticDir, 'files')))]

	for (const file of files) {
		const legacyPath = `/${path.relative(staticDir, file).split(path.sep).join('/')}`
		const mimetype = MIME[path.extname(file).toLowerCase()]
		if (!mimetype) continue

		const existing = await payload.find({ collection: 'media', where: { legacyPath: { equals: legacyPath } }, limit: 1, depth: 0 })
		if (existing.docs[0]) {
			mediaByLegacyPath.set(legacyPath, { id: Number(existing.docs[0].id), filename: existing.docs[0].filename ?? '' })
			continue
		}

		const data = await fs.readFile(file)
		const doc = await payload.create({
			collection: 'media',
			data: { legacyPath },
			file: { data, mimetype, name: mediaFilename(legacyPath), size: data.length }
		})
		mediaByLegacyPath.set(legacyPath, { id: Number(doc.id), filename: doc.filename ?? '' })
	}

	log(`media: ${mediaByLegacyPath.size} files`)
}

function media(legacyPath: string | undefined | null): number | null {
	if (!legacyPath) return null
	return mediaByLegacyPath.get(legacyPath)?.id ?? null
}

async function setAlt(legacyPath: string, alt: Record<Locale, string>): Promise<void> {
	const id = media(legacyPath)
	if (!id) return
	for (const locale of LOCALES) await payload.update({ collection: 'media', id, locale, data: { alt: alt[locale] } })
}

// ------------------------------------------------------------------------------------------ rich text

function codeLanguage(fence: string): string {
	const known = ['bash', 'csharp', 'css', 'dotenv', 'html', 'java', 'javascript', 'json', 'rust', 'sql', 'toml', 'typescript', 'vue', 'yaml']
	const aliases: Record<string, string> = { js: 'javascript', ts: 'typescript', sh: 'bash', yml: 'yaml', cs: 'csharp' }
	const lang = aliases[fence] ?? fence
	return known.includes(lang) ? lang : 'plaintext'
}

function markdownToLexical(markdown: string): SerializedEditorState {
	const placeholders = new Map<string, Json>()
	const hold = (node: Json): string => {
		const key = `XPLACEHOLDERX${placeholders.size}X`
		placeholders.set(key, node)
		return `\n\n${key}\n\n`
	}

	const prepared = markdown
		.replace(/^```([\w-]*)[^\n]*\n([\s\S]*?)^```[ \t]*$/gm, (_match, lang: string, code: string) =>
			hold({
				type: 'block',
				version: 2,
				format: '',
				fields: { id: objectId(), blockName: '', blockType: 'Code', language: codeLanguage(lang), code: code.replace(/\n$/, '') }
			})
		)
		.replace(/<div[^>]*>\s*<img\s+[^>]*src="([^"]+)"[^>]*\/?>\s*<\/div>/g, (match, src: string) => {
			const id = media(src)
			return id ? hold({ type: 'upload', version: 3, format: '', id: objectId(), fields: null, relationTo: 'media', value: id }) : match
		})
		.replace(/!\[[^\]]*\]\(([^)\s]+)\)/g, (match, src: string) => {
			const id = media(src)
			return id ? hold({ type: 'upload', version: 3, format: '', id: objectId(), fields: null, relationTo: 'media', value: id }) : match
		})

	const state = convertMarkdownToLexical({ editorConfig, markdown: prepared })
	const root = state.root as unknown as { children: Json[] }
	root.children = root.children.map(child => {
		const children = child.children as { text?: string }[] | undefined
		const text = child.type === 'paragraph' && children?.length === 1 ? children[0]?.text?.trim() : undefined
		return (text ? placeholders.get(text) : undefined) ?? child
	})
	return state
}

// ---------------------------------------------------------------------------------------- upsert kit

async function upsertBySlug(collection: 'projects' | 'posts', slug: string, perLocale: Record<Locale, Json | null>, publish: boolean): Promise<void> {
	const existing = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0, draft: true })
	const en = { ...perLocale.en, _status: publish ? 'published' : 'draft' }

	const saved = existing.docs[0]
		? await payload.update({ collection, id: existing.docs[0].id, locale: 'en', data: en as never, draft: !publish, depth: 0 })
		: await payload.create({ collection, locale: 'en', data: en as never, draft: !publish, depth: 0 })

	if (perLocale.cs) {
		const cs = withRowIds(saved, { ...perLocale.cs, _status: publish ? 'published' : 'draft' })
		await payload.update({ collection, id: saved.id, locale: 'cs', data: cs as never, draft: !publish, depth: 0 })
	}
}

type GlobalSlug = Parameters<Payload['updateGlobal']>[0]['slug']

async function writeGlobal(slug: GlobalSlug, build: (locale: Locale) => Json, drafts = false): Promise<void> {
	const status = drafts ? { _status: 'published' } : {}
	const saved = await payload.updateGlobal({ slug, locale: 'en', data: { ...build('en'), ...status } as never, depth: 0 })
	const cs = withRowIds(saved, { ...build('cs'), ...status })
	await payload.updateGlobal({ slug, locale: 'cs', data: cs as never, depth: 0 })
	log(`global ${slug}`)
}

async function replaceAll(collection: 'experience' | 'testimonials' | 'services', rows: Record<Locale, Json>[]): Promise<void> {
	await payload.delete({ collection, where: { id: { exists: true } } })
	for (const row of rows) {
		const saved = await payload.create({ collection, locale: 'en', data: { ...row.en, _status: 'published' } as never, depth: 0 })
		await payload.update({ collection, id: saved.id, locale: 'cs', data: withRowIds(saved, { ...row.cs, _status: 'published' }) as never, depth: 0 })
	}
	log(`${collection}: ${rows.length}`)
}

// ------------------------------------------------------------------------------------------ content

async function importProjects(): Promise<void> {
	const root = path.join(V6, 'src/projects')
	const slugs = (await fs.readdir(root, { withFileTypes: true })).filter(entry => entry.isDirectory()).map(entry => entry.name)

	for (const slug of slugs) {
		const files = Object.fromEntries(
			await Promise.all(LOCALES.map(async locale => [locale, matter(await fs.readFile(path.join(root, slug, `${locale}.md`), 'utf8'))] as const))
		) as Record<Locale, matter.GrayMatterFile<string>>
		const card = HOME_CARDS[slug]
		const front = files.en.data

		const shared = {
			slug,
			date: new Date(front.date).toISOString(),
			order: front.order ?? 99,
			layout: front.lede ? 'caseStudy' : 'simple',
			thumbnail: media(front.thumbnail),
			stack: front.stack ?? [],
			gallery: ((front.gallery as string[] | undefined) ?? []).map(media).filter(Boolean)
		}

		const build = (locale: Locale): Json => {
			const data = files[locale].data
			return {
				...shared,
				title: data.title,
				tags: data.tags ?? [],
				lede: data.lede ?? null,
				client: data.client ?? null,
				role: data.role ?? null,
				team: data.team ?? null,
				timeline: data.timeline ?? null,
				sector: data.sector ?? null,
				impact: data.impact ?? [],
				contributions: data.contributions ?? [],
				content: markdownToLexical(files[locale].content.trim()),
				card: {
					show: Boolean(card),
					size: card?.size ?? 'default',
					chips: card?.chips ?? [],
					cta: card?.cta ?? 'viewProject',
					company: card?.company ?? null,
					role: card?.role ?? null,
					badge: card?.badgeKey ? t(locale, `home.${card.badgeKey}`) : null,
					description: card ? t(locale, `home.${card.descKey}`) : null
				}
			}
		}

		await upsertBySlug('projects', slug, { en: build('en'), cs: build('cs') }, true)
	}

	log(`projects: ${slugs.length}`)
}

async function importPosts(): Promise<void> {
	const root = path.join(V6, 'src/posts')
	const files = (await listFiles(root)).filter(file => file.endsWith('.md'))

	for (const file of files) {
		const relative = path.relative(root, file).split(path.sep).join('/').replace(/\.md$/, '')
		const isPublic = !relative.split('/').some(part => part.startsWith('_'))
		const slug = isPublic
			? relative
			: relative
					.replace(/^_draft_/, '')
					.replace(/(^|\/)_/g, '$1')
					.replace(/\//g, '-')
		const parsed = matter(await fs.readFile(file, 'utf8'))
		const front = parsed.data

		for (const match of parsed.content.matchAll(/<img\s+[^>]*src="([^"]+)"/g)) {
			await setAlt(match[1]!, { en: front.title, cs: front.title })
		}

		const en: Json = {
			slug,
			date: new Date(front.date).toISOString(),
			author: front.author ?? 'Jan Komínek',
			readingTime: front.readingTime ?? null,
			title: front.title,
			description: front.description ?? null,
			tags: front.tags ?? [],
			thumbnail: media(front.thumbnail),
			content: markdownToLexical(parsed.content.trim()),
			legacyMarkdown: isPublic ? null : parsed.content.trim()
		}

		await upsertBySlug('posts', slug, { en, cs: null }, isPublic)
	}

	log(`posts: ${files.length}`)
}

async function importResumeEntries(): Promise<void> {
	await replaceAll(
		'experience',
		EXPERIENCE.map((entry, index) => {
			const build = (locale: Locale): Json => {
				const key = entry.key
				const orgKey = entry.kind === 'education' ? 'Org' : 'Company'
				return {
					kind: entry.kind,
					order: index,
					current: entry.current ?? false,
					dates: t(locale, `resume.${key}Dates`),
					duration: t(locale, `resume.${key}Duration`),
					role: t(locale, `resume.${key}Role`),
					organization: t(locale, `resume.${key}${orgKey}`),
					description: t(locale, `resume.${key}Desc`),
					highlights: Array.from({ length: entry.highlights }, (_, i) => ({ text: t(locale, `resume.${key}Hi${i + 1}`) })),
					chips: entry.chips.map(chip => ({ label: chip.label, accent: chip.accent ?? false }))
				}
			}
			return { en: build('en'), cs: build('cs') }
		})
	)

	await replaceAll(
		'testimonials',
		TESTIMONIALS.map((entry, index) => {
			const build = (locale: Locale): Json => ({
				order: index,
				name: entry.name,
				initials: entry.initials,
				role: t(locale, `home.testimonial${entry.key}Role`),
				quote: t(locale, `home.testimonial${entry.key}Quote`),
				linkedinUrl: TESTIMONIAL_LINK
			})
			return { en: build('en'), cs: build('cs') }
		})
	)

	await replaceAll(
		'services',
		SERVICE_CHIPS.map((chips, index) => {
			const n = index + 1
			const build = (locale: Locale): Json => ({
				order: index,
				number: t(locale, `home.service${n}Num`),
				title: t(locale, `home.service${n}Title`),
				description: t(locale, `home.service${n}Desc`),
				chips
			})
			return { en: build('en'), cs: build('cs') }
		})
	)
}

// ------------------------------------------------------------------------------------------ globals

function options(locale: Locale, group: string, keys: string[]): Json[] {
	return keys.map(key => ({ key, label: t(locale, `contact.form.${group}.${key}`) }))
}

const OPTION_KEYS = {
	projects: ['website', 'webApp', 'ecommerce', 'saas', 'api', 'mobileApp', 'desktopApp', 'admin', 'landingPage', 'other'],
	features: [
		'auth',
		'admin',
		'payment',
		'database',
		'files',
		'notifications',
		'realtime',
		'i18n',
		'analytics',
		'seo',
		'customAPI',
		'thirdParty',
		'responsive',
		'other'
	],
	technologies: [
		'wordpress',
		'vuejs',
		'reactjs',
		'svelte',
		'tailwind',
		'nodejs',
		'typescript',
		'sql',
		'nosql',
		'graphql',
		'cache',
		'docker',
		'aws',
		'gcp',
		'azure',
		'vps',
		'restAPI',
		'websocket',
		'other'
	],
	assets: ['design', 'codebase', 'database', 'branding', 'documentation', 'domain', 'hosting', 'other'],
	audiences: ['public', 'b2b', 'b2c', 'startup', 'internal', 'enterprise', 'nonprofit', 'developer', 'other'],
	hostings: ['client', 'need', 'server', 'other'],
	supports: ['onetime', 'ongoing', 'training', 'consultation', 'updates', 'other'],
	legals: ['nda', 'contract', 'standard', 'gdpr', 'other'],
	priorities: ['low', 'medium', 'high', 'critical', 'asap']
}

const VALIDATION: Record<Locale, Json> = {
	en: {
		required: 'This field is required.',
		invalidEmail: 'Enter a valid email.',
		tooLong: 'This is too long.',
		invalidOption: 'Choose one of the offered options.',
		invalidDate: 'Enter a valid date.',
		budgetRange: 'Choose a budget within the range.'
	},
	cs: {
		required: 'Toto pole je povinné.',
		invalidEmail: 'Zadejte platný e-mail.',
		tooLong: 'Text je příliš dlouhý.',
		invalidOption: 'Vyberte jednu z nabízených možností.',
		invalidDate: 'Zadejte platné datum.',
		budgetRange: 'Vyberte rozpočet v daném rozsahu.'
	}
}

const LEGAL_LABELS: Record<Locale, Json> = {
	en: {
		label: '◆ Legal',
		updatedLabel: 'Last updated',
		bindingNote: 'This page is also available in Czech. If the two versions differ, the Czech version prevails.',
		privacyTitle: 'Privacy policy',
		termsTitle: 'Terms of use',
		optOutTitle: 'Website statistics in this browser',
		optOutActive: 'This browser is counted in the anonymous statistics.',
		optOutInactive: 'This browser is excluded from the statistics.',
		optOutButton: 'Exclude this browser',
		optInButton: 'Include it again',
		privacyLink: 'Privacy',
		termsLink: 'Terms'
	},
	cs: {
		label: '◆ Právní informace',
		updatedLabel: 'Poslední aktualizace',
		bindingNote: 'Tato stránka je k dispozici také v angličtině. V případě rozporu má přednost česká verze.',
		privacyTitle: 'Ochrana osobních údajů',
		termsTitle: 'Podmínky užívání',
		optOutTitle: 'Statistiky návštěvnosti v tomto prohlížeči',
		optOutActive: 'Tento prohlížeč se započítává do anonymních statistik.',
		optOutInactive: 'Tento prohlížeč je ze statistik vyřazen.',
		optOutButton: 'Vyřadit tento prohlížeč',
		optInButton: 'Znovu započítávat',
		privacyLink: 'Ochrana soukromí',
		termsLink: 'Podmínky'
	}
}

async function importGlobals(): Promise<void> {
	const staticText = async (file: string): Promise<string> => fs.readFile(path.join(V6, 'static', file), 'utf8')
	const humans = (await staticText('humans.txt'))
		.replace(/^Last update: .*$/m, `Last update: ${new Date().toISOString().slice(0, 10)}`)
		.replace(/^Framework: .*$/m, 'Framework: Nuxt 4, Vue 3')
		.replace(/^Deployment: .*$/m, 'Deployment: Docker on a VPS, behind Traefik and Cloudflare')
		.replace(/^Content: .*$/m, 'Content: Payload CMS')
	const llms = await staticText('llms.txt')
	const llmsFull = await staticText('llms-full.txt')

	await writeGlobal('site', locale => ({
		name: 'Jan Komínek',
		alternateName: 'Jan Kominek',
		siteUrl: 'https://jankominek.com',
		email: 'contact@jankominek.com',
		linkedinUrl: 'https://www.linkedin.com/in/jan-kominek',
		calLink: 'jankominek/30min',
		skipToContent: locale === 'en' ? 'Skip to main content' : 'Přejít na hlavní obsah',
		title: SEO.site.title,
		description: SEO.site.description,
		keywords: SEO.site.keywords,
		image: media('/images/resume_profile.webp'),
		imageAlt: 'Jan Komínek, Fullstack Engineer',
		twitterHandle: '@jankominek',
		jobTitle: PERSON.jobTitle,
		personDescription: PERSON.personDescription,
		profileDescription: PERSON.profileDescription,
		portrait: media('/images/resume_profile.webp'),
		locality: 'Prague',
		country: 'CZ',
		sameAs: ['https://www.linkedin.com/in/jan-kominek/'],
		knowsAbout: PERSON.knowsAbout,
		occupationSkills: PERSON.occupationSkills,
		alumniOf: PERSON.alumniOf,
		offerCatalogName: PERSON.offerCatalogName,
		services: PERSON.services.map(name => ({ name })),
		humansTxt: humans,
		llmsTxt: llms,
		llmsFullTxt: llmsFull
	}))

	await writeGlobal('navigation', locale => ({
		monogram: 'J',
		homeLabel: locale === 'en' ? 'Jan Komínek, Home' : 'Jan Komínek, Domů',
		items: [
			{ label: t(locale, 'navbar.work'), href: '/', match: 'exact', visible: true },
			{ label: t(locale, 'navbar.resume'), href: '/resume', match: 'exact', visible: true },
			{ label: t(locale, 'navbar.blog'), href: '/blog', match: 'prefix', visible: true }
		],
		hire: { label: t(locale, 'navbar.hire'), href: '/contact' },
		toggleLanguageLabel: locale === 'en' ? 'Toggle language' : 'Přepnout jazyk',
		toggleMenuLabel: locale === 'en' ? 'Toggle menu' : 'Přepnout menu'
	}))

	await writeGlobal('footer', locale => ({
		label: t(locale, 'footer.contactMe'),
		headingBefore: locale === 'en' ? "Let's discuss your\nvision" : 'Probereme',
		ctaLabel: locale === 'en' ? "Let's talk →" : 'Napišme si →',
		ctaHref: '/contact',
		headingAfter: locale === 'en' ? 'with me.' : 'vaši vizi.',
		links: [
			{ label: t(locale, 'footer.email'), href: 'mailto:contact@jankominek.com', external: false, arrow: false },
			{ label: t(locale, 'footer.linkedin'), href: 'https://www.linkedin.com/in/jan-kominek', external: true, arrow: true },
			{ label: t(locale, 'footer.form'), href: '/contact', external: false, arrow: true },
			{ label: t(locale, 'footer.calendar'), href: '/contact#calendar', external: false, arrow: true }
		],
		privacyLabel: LEGAL_LABELS[locale].privacyLink,
		termsLabel: LEGAL_LABELS[locale].termsLink
	}))

	await writeGlobal(
		'home',
		locale => ({
			taglines: [{ text: t(locale, 'home.fullstack') }, { text: t(locale, 'home.freelance') }, { text: t(locale, 'home.prague') }],
			firstName: 'Jan',
			lastName: 'Komínek.',
			valueProp: stripHtmlTags(t(locale, 'home.valueProp')),
			primaryCta: { label: t(locale, 'home.startProject'), href: '/contact' },
			secondaryCta: { label: t(locale, 'home.viewResume'), href: '/resume' },
			stats: [
				{ value: '2022', label: t(locale, 'home.yearsLabel') },
				{ value: '12', label: t(locale, 'home.projectsLabel') },
				{ value: '6', label: t(locale, 'home.clientsLabel') }
			],
			portrait: media('/images/profile.webp'),
			availability: { status: t(locale, 'home.available'), detail: t(locale, 'home.upToLabel') },
			geoSummary: locale === 'en' ? GEO_SUMMARY : null,
			now: {
				label: t(locale, 'home.nowLabel'),
				title: t(locale, 'home.nowTitle'),
				description: t(locale, 'home.nowDesc'),
				date: t(locale, 'home.nowDate'),
				meta: t(locale, 'home.nowMeta')
			},
			work: { label: t(locale, 'home.workLabel'), heading: t(locale, 'home.workH2'), sub: t(locale, 'home.workP') },
			viewProjectLabel: t(locale, 'home.viewProject'),
			readCaseStudyLabel: t(locale, 'home.readCaseStudy'),
			services: { label: t(locale, 'home.servicesLabel'), heading: t(locale, 'home.servicesH2'), sub: t(locale, 'home.servicesP') },
			testimonials: { label: t(locale, 'home.testimonialsLabel'), heading: t(locale, 'home.testimonialsH2'), sub: t(locale, 'home.testimonialsP') },
			readMoreLabel: locale === 'en' ? 'Read more ↗' : 'Číst dál ↗',
			quoteLimit: 450,
			meta: locale === 'en' ? { title: SEO.home.title, description: SEO.home.description } : {}
		}),
		true
	)

	await writeGlobal(
		'resume',
		locale => ({
			label: t(locale, 'resume.label'),
			name: 'Jan Komínek',
			subtitle: t(locale, 'resume.subtitle'),
			bio: t(locale, 'resume.bio'),
			portrait: media('/images/resume_profile.webp'),
			cv: media('/files/Jan_Kominek_CV_08_2026.pdf'),
			downloadLabel: t(locale, 'resume.download'),
			hireCta: { label: t(locale, 'resume.hireBtn'), href: '/contact' },
			impact: RESUME_IMPACT.map(item => ({
				label: t(locale, `resume.${item.key}Label`),
				value: item.style === 'accent' && locale === 'cs' ? '◆ Dostupný' : item.value,
				sub: t(locale, `resume.${item.key}Sub`),
				style: item.style
			})),
			experience: { label: t(locale, 'resume.experienceLabel'), heading: t(locale, 'resume.expH2'), sub: t(locale, 'resume.expP') },
			ownProduct: { label: t(locale, 'resume.ownProductLabel'), heading: t(locale, 'resume.prodH2'), sub: t(locale, 'resume.prodP') },
			leadership: { label: t(locale, 'resume.leadershipLabel'), heading: t(locale, 'resume.leadH2'), sub: t(locale, 'resume.leadP') },
			education: { label: t(locale, 'resume.educationLabel'), heading: t(locale, 'resume.eduH2') },
			skills: { label: t(locale, 'resume.toolsLabel'), heading: t(locale, 'resume.skillsH2'), sub: t(locale, 'resume.skillsP') },
			skillGroups: SKILL_GROUPS.map(group => ({
				title: t(locale, `resume.${group.key}`),
				skills: group.skills.map(([name, primary]) => ({ name, primary }))
			})),
			meta: locale === 'en' ? { title: SEO.resume.title, description: SEO.resume.description } : {}
		}),
		true
	)

	await writeGlobal('blog', locale => ({
		label: t(locale, 'blog.writingLabel'),
		heading: t(locale, 'blog.h1'),
		minutesShort: 'MIN',
		minutesLong: locale === 'en' ? 'min read' : 'min čtení',
		shareLabel: locale === 'en' ? '◆ Found this useful?' : '◆ Bylo to užitečné?',
		shareText:
			locale === 'en'
				? "Share it with someone who'd benefit, or subscribe to get new posts."
				: 'Pošlete to někomu, komu to pomůže, nebo se přihlaste k odběru nových článků.',
		shareOnXLabel: locale === 'en' ? 'Share on X →' : 'Sdílet na X →',
		rssLabel: locale === 'en' ? 'RSS feed →' : 'RSS kanál →',
		feedTitle: 'Jan Komínek · Engineering Blog',
		feedDescription: 'DevOps, SvelteKit, TypeScript, and system architecture, by Jan Komínek, Fullstack Engineer based in Prague.',
		meta: locale === 'en' ? { title: SEO.blog.title, description: SEO.blog.description } : {}
	}))

	await writeGlobal('contact', locale => ({
		label: t(locale, 'contact.hireLabel'),
		heading: t(locale, 'contact.h1'),
		intro: t(locale, 'contact.intro'),
		emailLabel: t(locale, 'contact.emailDirect'),
		linkedinLabel: 'LinkedIn',
		linkedinSub: t(locale, 'contact.linkedinSub'),
		bookCallLabel: t(locale, 'contact.bookCall'),
		bookCallSub: t(locale, 'contact.freeChat'),
		includeLabel: t(locale, 'contact.whatToInclude'),
		includeText: t(locale, 'contact.whatToIncludeText'),
		briefTitle: t(locale, 'contact.projectBrief'),
		briefStep: t(locale, 'contact.formStep'),
		skipFormLabel: t(locale, 'contact.skipForm'),
		skipFormText: t(locale, 'contact.skipFormDesc'),
		meta: locale === 'en' ? { title: SEO.contact.title, description: SEO.contact.description } : {}
	}))

	await writeGlobal('contact-form', locale => {
		const f = (key: string): string => t(locale, `contact.form.${key}`)
		return {
			fullName: { label: f('fullName'), placeholder: f('fullNamePlaceholder') },
			email: { label: f('email'), placeholder: f('emailPlaceholder') },
			message: { label: f('message'), placeholder: f('messagePlaceholder') },
			budget: { label: f('budget'), currency: '€', min: 1000, max: 25000, step: 250, default: 2500 },
			advancedLabel: f('advanced'),
			company: { label: f('company'), placeholder: f('companyPlaceholder') },
			projectType: { label: f('projectType'), emptyOption: f('projects.none'), options: options(locale, 'projects', OPTION_KEYS.projects) },
			features: { label: f('feature'), placeholder: f('featurePlaceholder'), options: options(locale, 'features', OPTION_KEYS.features) },
			technologies: {
				label: f('technology'),
				placeholder: f('technologyPlaceholder'),
				options: options(locale, 'technologies', OPTION_KEYS.technologies)
			},
			assets: { label: f('asset'), placeholder: f('assetPlaceholder'), options: options(locale, 'assets', OPTION_KEYS.assets) },
			audiences: { label: f('audience'), placeholder: f('audiencePlaceholder'), options: options(locale, 'audiences', OPTION_KEYS.audiences) },
			hosting: { label: f('hosting'), emptyOption: f('hostings.none'), options: options(locale, 'hostings', OPTION_KEYS.hostings) },
			support: { label: f('support'), emptyOption: f('supports.none'), options: options(locale, 'supports', OPTION_KEYS.supports) },
			legals: { label: f('legal'), placeholder: f('legalPlaceholder'), options: options(locale, 'legals', OPTION_KEYS.legals) },
			deadline: { label: f('deadline') },
			priority: { label: f('priority'), emptyOption: f('priorities.none'), options: options(locale, 'priorities', OPTION_KEYS.priorities) },
			sendLabel: f('send'),
			sendingLabel: f('sending'),
			successMessage: f('success'),
			errorMessage: f('errors.api'),
			validation: VALIDATION[locale]
		}
	})

	await writeGlobal('project-page', locale =>
		locale === 'en'
			? {
					backLabel: '← Work',
					caseStudyLabel: 'Case Study',
					roleLabel: 'Role',
					teamLabel: 'Team',
					timelineLabel: 'Timeline',
					sectorLabel: 'Sector',
					challengeLabel: 'The challenge',
					contributionsLabel: 'What I owned',
					stackLabel: 'Stack',
					metaSuffix: 'A project by Jan Komínek, Fullstack Engineer.'
				}
			: {
					backLabel: '← Projekty',
					caseStudyLabel: 'Případová studie',
					roleLabel: 'Role',
					teamLabel: 'Tým',
					timelineLabel: 'Období',
					sectorLabel: 'Odvětví',
					challengeLabel: 'Výzva',
					contributionsLabel: 'Co jsem vlastnil',
					stackLabel: 'Stack',
					metaSuffix: 'Projekt Jana Komínka, Fullstack Engineera.'
				}
	)

	await writeGlobal('errors', locale => ({
		backLabel: locale === 'en' ? '← Back to home' : '← Zpět na úvod',
		fallbackMessage: locale === 'en' ? 'Something went wrong.' : 'Něco se pokazilo.',
		messages: Object.keys(HTTP_STATUS_TITLES).map(status => ({
			status: Number(status),
			title: HTTP_STATUS_TITLES[status],
			message: t(locale, `errors.${status}`)
		}))
	}))

	const today = new Date().toISOString()
	await writeGlobal(
		'privacy',
		locale => ({
			label: LEGAL_LABELS[locale].label,
			title: LEGAL_LABELS[locale].privacyTitle,
			updatedAt: today,
			updatedLabel: LEGAL_LABELS[locale].updatedLabel,
			bindingNote: LEGAL_LABELS[locale].bindingNote,
			content: markdownToLexical(privacyMarkdown[locale]),
			optOutTitle: LEGAL_LABELS[locale].optOutTitle,
			optOutActive: LEGAL_LABELS[locale].optOutActive,
			optOutInactive: LEGAL_LABELS[locale].optOutInactive,
			optOutButton: LEGAL_LABELS[locale].optOutButton,
			optInButton: LEGAL_LABELS[locale].optInButton
		}),
		true
	)

	await writeGlobal(
		'terms',
		locale => ({
			label: LEGAL_LABELS[locale].label,
			title: LEGAL_LABELS[locale].termsTitle,
			updatedAt: today,
			updatedLabel: LEGAL_LABELS[locale].updatedLabel,
			bindingNote: LEGAL_LABELS[locale].bindingNote,
			content: markdownToLexical(termsMarkdown[locale])
		}),
		true
	)
}

// ---------------------------------------------------------------------------------------- redirects

async function importRedirects(): Promise<void> {
	const rows: { from: string; to: string }[] = [{ from: '/projects/disenchament', to: '/projects/disenchantment' }]
	for (const [legacyPath, doc] of mediaByLegacyPath) {
		rows.push({ from: legacyPath, to: legacyPath.startsWith('/files/Jan_Kominek_CV') ? '/cv.pdf' : `/media/${doc.filename}` })
	}

	for (const row of rows) {
		const existing = await payload.find({ collection: 'redirects', where: { from: { equals: row.from } }, limit: 1, depth: 0 })
		if (existing.docs[0]) await payload.update({ collection: 'redirects', id: existing.docs[0].id, data: { ...row, permanent: true } })
		else await payload.create({ collection: 'redirects', data: { ...row, permanent: true } })
	}

	log(`redirects: ${rows.length}`)
}

// --------------------------------------------------------------------------------------- api users

async function ensureApiUser(email: string, role: 'reader' | 'contact', apiKey: string | undefined): Promise<void> {
	if (!apiKey) return
	const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, depth: 0 })
	const data = { email, role, enableAPIKey: true, apiKey }
	if (existing.docs[0]) await payload.update({ collection: 'users', id: existing.docs[0].id, data })
	else await payload.create({ collection: 'users', data: { ...data, password: randomBytes(32).toString('base64url') } })
	log(`api user ${email}`)
}

// -------------------------------------------------------------------------------------------- main

log(`reading ${V6}`)
await importMedia()
await setAlt('/images/profile.webp', { en: 'Jan Komínek, Fullstack Engineer', cs: 'Jan Komínek, Fullstack Engineer' })
await setAlt('/images/resume_profile.webp', { en: 'Jan Komínek, portrait', cs: 'Jan Komínek, portrét' })
await importProjects()
await importPosts()
await importResumeEntries()
await importGlobals()
await importRedirects()
await ensureApiUser('reader@portfolio.internal', 'reader', process.env.CMS_READ_API_KEY)
await ensureApiUser('contact@portfolio.internal', 'contact', process.env.CMS_CONTACT_API_KEY)
log('done')
process.exit(0)
