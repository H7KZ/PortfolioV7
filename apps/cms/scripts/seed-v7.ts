/**
 * Writes the V7 redesign copy and images into Payload.
 *
 *   pnpm --filter @portfolio/cms run seed:v7 [--dry-run]
 *
 * Reads docs/redesign/content/copy.{en,cs}.json and docs/redesign/assets (override with V7_COPY_DIR and
 * V7_ASSETS_DIR). English is written first and Czech second, reusing the English array row ids so localized
 * sub-fields pair up. Every document is compared with what is stored and only written when it differs, so a
 * second run reports no changes. --dry-run prints those differences and writes nothing.
 *
 * Refuses to run against anything but a local database unless SEED_V7_ALLOW_REMOTE=1 is set.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { getPayload, type Payload } from 'payload'
import config from '../src/payload.config'

type Locale = 'en' | 'cs'
type Json = Record<string, unknown>

const LOCALES: Locale[] = ['en', 'cs']
const DRY_RUN = process.argv.includes('--dry-run')
const dirname = path.dirname(fileURLToPath(import.meta.url))
const REDESIGN = path.resolve(dirname, '../../../docs/redesign')
const COPY_DIR = path.resolve(process.env.V7_COPY_DIR ?? path.join(REDESIGN, 'content'))
const ASSETS_DIR = path.resolve(process.env.V7_ASSETS_DIR ?? path.join(REDESIGN, 'assets'))

/** Alt text per image in docs/redesign/assets/manifest.json. It says what the picture shows. */
const ALT: Record<string, Record<Locale, string>> = {
	'deeptrace-thumbnail': {
		en: 'DeepTrace lineage view: a graph of processing steps for an Earth Observation file, each step marked as verified',
		cs: 'Pohled DeepTrace na původ dat: graf kroků zpracování souboru z pozorování Země, každý krok označený jako ověřený'
	},
	'deeptrace-hashchain': {
		en: 'DeepTrace hash-chain view listing each link of a file’s history with its SHA-256 hash and verification state',
		cs: 'Pohled DeepTrace na řetězec hashů: každý článek historie souboru s hashem SHA-256 a stavem ověření'
	},
	'iont-thumbnail': {
		en: 'IONT driver app on a phone, showing a charger on the map and the start charging button',
		cs: 'Aplikace IONT pro řidiče v telefonu s nabíječkou na mapě a tlačítkem pro spuštění nabíjení'
	},
	'iont-landing': {
		en: 'IONT landing page introducing the public EV charging network',
		cs: 'Úvodní stránka IONT představující veřejnou síť nabíječek pro elektromobily'
	},
	'iont-phones': {
		en: 'Three phones with the IONT driver app: finding a charger, paying and following a live charging session',
		cs: 'Tři telefony s aplikací IONT: hledání nabíječky, platba a průběh nabíjení v reálném čase'
	},
	'iont-charge': {
		en: 'IONT charge screen with the live session: energy delivered, time and price',
		cs: 'Obrazovka nabíjení IONT s probíhající relací: dodaná energie, čas a cena'
	},
	'iont-admin': {
		en: 'IONT admin panel running on the charger, with configuration and diagnostics',
		cs: 'Administrace IONT běžící přímo v nabíječce, s nastavením a diagnostikou'
	},
	'kreditozrouti-dark': {
		en: 'Kreditožrouti in dark mode: a weekly timetable with courses placed by day and hour',
		cs: 'Kreditožrouti v tmavém režimu: týdenní rozvrh s předměty rozmístěnými podle dnů a hodin'
	},
	'kreditozrouti-desktop': {
		en: 'Kreditožrouti in light mode on a desktop: course search next to the timetable',
		cs: 'Kreditožrouti ve světlém režimu na počítači: vyhledávání předmětů vedle rozvrhu'
	},
	'kreditozrouti-mobile': {
		en: 'Kreditožrouti on a phone, showing the day view of a timetable',
		cs: 'Kreditožrouti v telefonu s denním pohledem na rozvrh'
	},
	'scorecard-thumbnail': {
		en: 'Scorecard audit table with risk ratings per control',
		cs: 'Auditní tabulka Scorecard s hodnocením rizik pro jednotlivá opatření'
	},
	'scorecard-main': {
		en: 'Scorecard report view, ready to export as a branded PDF',
		cs: 'Náhled reportu Scorecard připravený k exportu do PDF s logem klienta'
	},
	'disenchantment-thumbnail-crop': {
		en: 'Minecraft anvil with an enchanted item and the Disenchantment result slot',
		cs: 'Kovadlina v Minecraftu s očarovaným předmětem a výsledkem pluginu Disenchantment'
	},
	'disenchantment-anvil': {
		en: 'Disenchantment anvil screen moving an enchantment from a sword onto a book',
		cs: 'Obrazovka kovadliny Disenchantment přesouvající očarování z meče do knihy'
	},
	portrait: {
		en: 'Jan Komínek, smiling, in a dark jacket against a plain background',
		cs: 'Jan Komínek s úsměvem v tmavé bundě na jednobarevném pozadí'
	},
	'portrait-resume': {
		en: 'Portrait of Jan Komínek',
		cs: 'Portrét Jana Komínka'
	},
	'post-traefik-cover': {
		en: 'Diagram of Traefik routing requests from Cloudflare to Docker containers',
		cs: 'Schéma Traefiku, který směruje požadavky z Cloudflare do kontejnerů Dockeru'
	}
}

/** Strings the design needs that the copy JSON does not carry yet. */
const EXTRA: Record<Locale, { navLabel: string; newTabLabel: string; primarySkillLabel: string; personDescription: string }> = {
	en: {
		navLabel: 'Main navigation',
		newTabLabel: '(opens in a new tab)',
		primarySkillLabel: '(daily)',
		personDescription:
			'Freelance fullstack engineer based in Prague, Czech Republic. Takes products from an empty repository to production with TypeScript, Vue, React, Node.js, PostgreSQL and Docker. Seven companies since 2022; creates and runs Kreditožrouti, a live course scheduler. Available for part-time B2B work, around 10 hours a week, hybrid in Prague or fully remote. Not the Czech actor of the same name.'
	},
	cs: {
		navLabel: 'Hlavní navigace',
		newTabLabel: '(otevře se v nové kartě)',
		primarySkillLabel: '(denně)',
		personDescription:
			'Fullstack inženýr na volné noze z Prahy. Dovádí produkty od prázdného repozitáře do produkce s TypeScriptem, Vue, Reactem, Node.js, PostgreSQL a Dockerem. Od roku 2022 sedm firem; vytvořil a provozuje Kreditožrouty, živý plánovač rozvrhu. K dispozici na částečný B2B úvazek, zhruba 10 hodin týdně, hybridně v Praze nebo plně na dálku. Nejde o stejnojmenného českého herce.'
	}
}

const MIME: Record<string, string> = { '.avif': 'image/avif', '.webp': 'image/webp' }

function log(message: string): void {
	console.log(`seed-v7: ${message}`)
}

function isObject(value: unknown): value is Json {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const LOCAL_DATABASE = { hosts: ['localhost', '127.0.0.1', '::1'], port: '45432' }

/** The production database is reached through a tunnel on 127.0.0.1 too, so the port of docker-compose.local.yml is what tells them apart. */
function assertLocalDatabase(): void {
	const uri = process.env.DATABASE_URI ?? ''
	if (!uri || process.env.SEED_V7_ALLOW_REMOTE === '1') return
	const { hostname, port } = new URL(uri)
	if (!LOCAL_DATABASE.hosts.includes(hostname) || port !== LOCAL_DATABASE.port) {
		throw new Error(`DATABASE_URI points at ${hostname}:${port}, not the local Docker database. Set SEED_V7_ALLOW_REMOTE=1 to seed it on purpose.`)
	}
}

assertLocalDatabase()

const payload: Payload = await getPayload({ config })
const editorConfig = await editorConfigFactory.default({ config: payload.config })
const copy: Record<Locale, Json> = {
	en: JSON.parse(await fs.readFile(path.join(COPY_DIR, 'copy.en.json'), 'utf8')),
	cs: JSON.parse(await fs.readFile(path.join(COPY_DIR, 'copy.cs.json'), 'utf8'))
}
const manifest = JSON.parse(await fs.readFile(path.join(ASSETS_DIR, 'manifest.json'), 'utf8')) as {
	assets: { name: string; width: number; height: number; files: string[] }[]
}

let changed = 0
let unchanged = 0

function pick<T = Json>(locale: Locale, dotted: string): T {
	const value = dotted.split('.').reduce<unknown>((node, part) => (node as Json | undefined)?.[part], copy[locale])
	if (value === undefined) throw new Error(`copy.${locale}.json has no ${dotted}`)
	return value as T
}

// ------------------------------------------------------------------------------------------- diffing

function same(a: unknown, b: unknown): boolean {
	const empty = (value: unknown) => value === null || value === undefined || value === ''
	if (empty(a) && empty(b)) return true
	if (typeof a === 'number' || typeof b === 'number') return Number(a) === Number(b)
	return a === b
}

/** Paths where `stored` differs from `desired`, looking only at keys `desired` sets and ignoring row ids. */
function differences(stored: unknown, desired: unknown, prefix = ''): string[] {
	if (Array.isArray(desired)) {
		const rows = Array.isArray(stored) ? stored : []
		if (rows.length !== desired.length) return [`${prefix} (${rows.length} → ${desired.length} rows)`]
		return desired.flatMap((row, index) => differences(rows[index], row, `${prefix}[${index}]`))
	}
	if (isObject(desired)) {
		if (desired.root && isObject(desired.root)) {
			return lexicalText(stored) === lexicalText(desired) ? [] : [`${prefix} (rich text)`]
		}
		const record = isObject(stored) ? stored : {}
		return Object.entries(desired)
			.filter(([key]) => key !== 'id')
			.flatMap(([key, value]) => differences(record[key], value, prefix ? `${prefix}.${key}` : key))
	}
	return same(stored, desired) ? [] : [`${prefix}: ${preview(stored)} → ${preview(desired)}`]
}

function preview(value: unknown): string {
	const text = JSON.stringify(value) ?? 'undefined'
	return text.length > 60 ? `${text.slice(0, 57)}...` : text
}

function lexicalText(state: unknown): string {
	const walk = (node: unknown): string => {
		if (!isObject(node)) return ''
		if (typeof node.text === 'string') return node.text
		const children = Array.isArray(node.children) ? node.children : []
		const joined = children.map(walk).join(node.type === 'root' ? '\n\n' : '')
		return joined
	}
	return isObject(state) ? walk(state.root).trim() : ''
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
	if (isObject(next) && isObject(stored) && !next.root) {
		return Object.fromEntries(Object.entries(next).map(([key, value]) => [key, withRowIds(stored[key], value)]))
	}
	return next
}

function report(label: string, diff: string[]): boolean {
	if (diff.length === 0) {
		unchanged += 1
		return false
	}
	changed += 1
	log(`${DRY_RUN ? 'would change' : 'changing'} ${label}`)
	for (const line of diff.slice(0, 25)) console.log(`    ${line}`)
	if (diff.length > 25) console.log(`    ... ${diff.length - 25} more`)
	return true
}

// --------------------------------------------------------------------------------------------- writes

type GlobalSlug = Parameters<Payload['updateGlobal']>[0]['slug']
type CollectionSlug = 'projects' | 'posts' | 'experience' | 'testimonials' | 'services' | 'media'

async function writeGlobal(slug: GlobalSlug, build: (locale: Locale) => Json, drafts = false): Promise<void> {
	const status = drafts ? { _status: 'published' } : {}
	let english: unknown = null
	for (const locale of LOCALES) {
		const stored = await payload.findGlobal({ slug, locale, depth: 0, fallbackLocale: false as never })
		const data = locale === 'en' ? { ...build('en'), ...status } : withRowIds(english ?? stored, { ...build('cs'), ...status })
		const write = report(`global ${slug} [${locale}]`, differences(stored, data))
		const saved = write && !DRY_RUN ? await payload.updateGlobal({ slug, locale, data: data as never, depth: 0 }) : stored
		if (locale === 'en') english = saved
	}
}

/** Updates (or creates, when `id` is null) one document, English first, then Czech. Returns its id. */
async function writeDocument(collection: CollectionSlug, label: string, id: number | null, build: (locale: Locale) => Json): Promise<number | null> {
	let english: unknown = null
	let docId = id
	for (const locale of LOCALES) {
		const stored = docId ? await payload.findByID({ collection, id: docId, locale, depth: 0, draft: false, fallbackLocale: false as never }) : null
		const data = locale === 'en' ? build('en') : withRowIds(english ?? stored, build('cs'))
		const write = report(`${collection}/${label} [${locale}]`, docId ? differences(stored, data) : ['(new document)'])
		if (!write || DRY_RUN) {
			if (locale === 'en') english = stored
			continue
		}
		const saved = docId
			? await payload.update({ collection, id: docId, locale, data: data as never, depth: 0 })
			: await payload.create({ collection, locale, data: data as never, depth: 0 })
		docId = Number(saved.id)
		if (locale === 'en') english = saved
	}
	return docId
}

// --------------------------------------------------------------------------------------------- media

const mediaByName = new Map<string, number>()

async function findMedia(filename: string): Promise<number | null> {
	const found = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0 })
	return found.docs[0] ? Number(found.docs[0].id) : null
}

async function uploadFile(filename: string): Promise<number | null> {
	const existing = await findMedia(filename)
	if (existing) return existing
	changed += 1
	log(`${DRY_RUN ? 'would upload' : 'uploading'} media ${filename}`)
	if (DRY_RUN) return null
	const data = await fs.readFile(path.join(ASSETS_DIR, filename))
	const doc = await payload.create({
		collection: 'media',
		data: {},
		file: { data, mimetype: MIME[path.extname(filename)] ?? 'application/octet-stream', name: filename, size: data.length }
	})
	return Number(doc.id)
}

async function importMedia(): Promise<void> {
	for (const asset of manifest.assets) {
		const ids = new Map<string, number | null>()
		for (const file of asset.files) ids.set(file, await uploadFile(file))

		const primary = `${asset.name}.webp`
		const id = ids.get(primary) ?? null
		const alt = ALT[asset.name]
		if (!alt) throw new Error(`ALT has no entry for ${asset.name}`)

		const has = (file: string) => asset.files.includes(file)
		const formats = {
			avif: has(`${asset.name}.avif`) ? `${asset.name}.avif` : null,
			avif800: has(`${asset.name}-800.avif`) ? `${asset.name}-800.avif` : null,
			webp800: has(`${asset.name}-800.webp`) ? `${asset.name}-800.webp` : null
		}
		if (id) {
			await writeDocument('media', primary, id, locale => ({ alt: alt[locale], formats }))
			mediaByName.set(asset.name, id)
		}
	}
	log(`media: ${mediaByName.size} images`)
}

function image(name: string | undefined | null): number | null {
	if (!name) return null
	return mediaByName.get(name) ?? null
}

// ----------------------------------------------------------------------------------------- rich text

function paragraphs(texts: string[]): Json {
	return convertMarkdownToLexical({ editorConfig, markdown: texts.join('\n\n') }) as unknown as Json
}

// ------------------------------------------------------------------------------------------- globals

interface Link {
	label: string
	href: string
}

async function importGlobals(): Promise<void> {
	await writeGlobal('navigation', locale => {
		const nav = pick<Json>(locale, 'globals.navigation')
		const mobile = nav.mobileMenu as Json
		return {
			wordmark: nav.wordmark,
			navLabel: EXTRA[locale].navLabel,
			items: (nav.items as Json[]).map(item => ({ label: item.label, href: item.href, match: item.match, visible: true })),
			hire: nav.hire,
			toggleLanguageLabel: nav.toggleLanguageLabel,
			toggleMenuLabel: nav.toggleMenuLabel,
			closeMenuLabel: nav.closeMenuLabel,
			currentLabel: nav.currentLabel,
			languageNames: mobile.languages,
			mobileMenu: { extraItems: mobile.extraItems, primaryCta: mobile.primaryCta, email: mobile.email }
		}
	})

	await writeGlobal('footer', locale => {
		const footer = pick<Json>(locale, 'globals.footer')
		const cta = footer.cta as Json
		const terminal = cta.terminal as { prompt: string; rows: Json[] }
		return {
			cta: {
				title: cta.title,
				titleAccent: cta.titleAccent,
				body: cta.body,
				primaryCta: cta.primaryCta,
				secondaryCtaLabel: (cta.secondaryCta as Link).label,
				terminalPrompt: terminal.prompt,
				terminalRows: terminal.rows.map(row => ({ key: row.key, value: row.value, href: row.href ?? null, live: row.live === true }))
			},
			copyright: footer.copyright,
			links: (footer.links as Json[]).map(row => ({
				label: row.label,
				href: row.href,
				external: row.external === true,
				arrow: row.arrow === true
			})),
			privacyLabel: (footer.links as Json[])[0]?.label,
			termsLabel: (footer.links as Json[])[1]?.label
		}
	})

	await writeGlobal(
		'home',
		locale => {
			const home = pick<Json>(locale, 'globals.home')
			const hero = home.hero as Json
			const now = home.now as Json
			const work = home.work as Json
			const more = home.more as Json
			const services = home.services as Json
			const testimonials = home.testimonials as Json
			return {
				eyebrowCommand: hero.eyebrowCommand,
				headline: hero.headline,
				valueProp: hero.valueProp,
				primaryCta: hero.primaryCta,
				secondaryCta: hero.secondaryCta,
				availability: { detail: hero.availability },
				portrait: image('portrait'),
				portraitCaption: hero.portraitCaption,
				now: { label: now.label, items: now.items },
				work: { heading: work.heading, sub: work.sub },
				readCaseStudyLabel: work.readCaseStudyLabel,
				more: {
					heading: more.heading,
					sub: more.sub,
					items: (more.items as Json[]).map(item => ({
						meta: item.meta,
						title: item.title,
						description: item.description,
						linkLabel: item.linkLabel,
						href: item.href ?? null,
						external: item.external === true
					}))
				},
				services: { heading: services.heading, sub: services.sub },
				testimonials: { heading: testimonials.heading, sub: testimonials.sub },
				readMoreLabel: testimonials.readMoreLabel,
				quoteLimit: testimonials.quoteLimit
			}
		},
		true
	)

	await writeGlobal('project-page', locale => {
		const labels = pick<Json>(locale, 'globals.project-page')
		return { ...labels }
	})

	await writeGlobal(
		'resume',
		locale => {
			const resume = pick<Json>(locale, 'globals.resume')
			const header = (key: string) => {
				const section = resume[key] as Json
				return { heading: section.heading, ...(key === 'education' ? {} : { sub: section.sub }) }
			}
			return {
				label: resume.label,
				name: resume.name,
				subtitle: resume.subtitle,
				bio: resume.bio,
				portrait: image('portrait-resume'),
				downloadLabel: resume.downloadLabel,
				hireCta: resume.hireCta,
				impact: resume.impact,
				experience: header('experience'),
				ownProduct: header('ownProduct'),
				leadership: header('leadership'),
				education: header('education'),
				skills: header('skills'),
				primarySkillLabel: EXTRA[locale].primarySkillLabel,
				skillGroups: (resume.skillGroups as { title: string; skills: string[] }[]).map(group => ({
					title: group.title,
					skills: group.skills.map(skill => ({ name: skill.replace(/\*$/, ''), primary: skill.endsWith('*') }))
				}))
			}
		},
		true
	)

	await writeGlobal('contact', locale => {
		const contact = pick<Json>(locale, 'globals.contact')
		return { ...contact }
	})

	await writeGlobal('contact-form', locale => {
		const form = pick<Json>(locale, 'globals.contact-form')
		const message = form.message as Json
		const budget = form.budget as Json
		const validation = form.validation as Json
		return {
			fullName: form.fullName,
			email: form.email,
			message: { label: message.label, placeholder: message.placeholder, placeholderShort: message.placeholderShort },
			budget: { label: budget.label, hint: budget.hint, options: budget.options },
			advancedLabel: form.advancedLabel,
			advancedHint: form.advancedHint,
			privacyNote: form.privacyNote,
			sendLabel: form.sendLabel,
			sendingLabel: form.sendingLabel,
			success: form.success,
			errorMessage: form.errorMessage,
			validation: {
				summaryOne: validation.summaryOne,
				summaryMany: validation.summaryMany,
				required: validation.required,
				invalidEmail: validation.invalidEmail,
				tooShort: validation.tooShort,
				tooLong: validation.tooLong,
				invalidOption: validation.invalidOption,
				invalidDate: validation.invalidDate
			}
		}
	})

	const storedErrors: Record<Locale, Json> = {
		en: (await payload.findGlobal({ slug: 'errors', locale: 'en', depth: 0 })) as unknown as Json,
		cs: (await payload.findGlobal({ slug: 'errors', locale: 'cs', depth: 0 })) as unknown as Json
	}
	await writeGlobal('errors', locale => {
		const errors = pick<Json>(locale, 'globals.errors')
		const fresh = errors.messages as Json[]
		const kept = ((storedErrors[locale].messages as Json[] | undefined) ?? []).filter(row => !fresh.some(entry => entry.status === row.status))
		const ordered = [...fresh, ...kept].map(row => ({ status: row.status, title: row.title, message: row.message }))
		return {
			backLabel: errors.backLabel,
			fallbackMessage: errors.fallbackMessage,
			codeLabel: errors.codeLabel,
			messages: ordered,
			suggestions: errors.suggestions
		}
	})

	await writeGlobal('blog', locale => {
		const blog = pick<Json>(locale, 'globals.blog')
		return { ...blog }
	})

	await writeGlobal('site', locale => {
		const resume = pick<Json>(locale, 'globals.resume')
		const skills = (resume.skillGroups as { skills: string[] }[]).flatMap(group => group.skills.filter(skill => skill.endsWith('*')))
		return {
			newTabLabel: EXTRA[locale].newTabLabel,
			jobTitle: 'Fullstack Engineer',
			personDescription: EXTRA[locale].personDescription,
			sameAs: ['https://www.linkedin.com/in/jan-kominek', 'https://github.com/H7KZ'],
			knowsAbout: skills.map(skill => skill.replace(/\*$/, ''))
		}
	})
}

// --------------------------------------------------------------------------------------- collections

async function importServices(): Promise<void> {
	const stored = await payload.find({ collection: 'services', sort: 'order', limit: 100, depth: 0, draft: false })
	const rows = pick<Json[]>('en', 'collections.services')
	for (const [index] of rows.entries()) {
		const id = stored.docs[index] ? Number(stored.docs[index].id) : null
		await writeDocument('services', String(index + 1), id, locale => {
			const row = pick<Json[]>(locale, 'collections.services')[index]!
			return {
				order: row.order,
				label: row.label,
				number: String(row.order).padStart(2, '0'),
				title: row.title,
				description: row.description,
				chips: row.chips,
				_status: 'published'
			}
		})
	}
}

async function importTestimonials(): Promise<void> {
	const stored = await payload.find({ collection: 'testimonials', limit: 100, depth: 0, draft: false })
	const rows = pick<Json[]>('en', 'collections.testimonials')
	for (const [index, row] of rows.entries()) {
		const id = stored.docs.find(doc => doc.name === row.name)?.id ?? null
		await writeDocument('testimonials', String(row.name), id ? Number(id) : null, locale => {
			const localized = pick<Json[]>(locale, 'collections.testimonials')[index]!
			return {
				order: localized.order,
				name: localized.name,
				initials: localized.initials,
				role: localized.role,
				quote: localized.quote,
				show: true,
				quoteLanguage: 'en',
				_status: 'published'
			}
		})
	}
	for (const doc of stored.docs.filter(doc => !rows.some(row => row.name === doc.name))) {
		await writeDocument('testimonials', doc.name, Number(doc.id), () => ({ show: false, _status: 'published' }))
	}
}

async function importExperience(): Promise<void> {
	const groups = pick<Record<string, Json[]>>('en', 'collections.experience')
	const stored = await payload.find({ collection: 'experience', sort: 'order', limit: 200, depth: 0, draft: false })
	let order = 0
	for (const [kind, entries] of Object.entries(groups)) {
		const existing = stored.docs.filter(doc => doc.kind === kind)
		for (const [index] of entries.entries()) {
			order += 1
			const position = order
			const id = existing[index] ? Number(existing[index].id) : null
			await writeDocument('experience', `${kind}#${index + 1}`, id, locale => {
				const entry = pick<Record<string, Json[]>>(locale, 'collections.experience')[kind]![index]!
				return {
					kind,
					order: position,
					current: entry.current === true,
					dates: entry.dates,
					duration: entry.duration ?? null,
					role: entry.role,
					organization: entry.organization,
					description: entry.description ?? null,
					highlights: ((entry.highlights as string[] | undefined) ?? []).map(text => ({ text })),
					chips: ((entry.chips as string[] | undefined) ?? []).map(label => ({ label, accent: false })),
					_status: 'published'
				}
			})
		}
		const surplus = existing.slice(entries.length)
		for (const doc of surplus) {
			changed += 1
			log(`${DRY_RUN ? 'would delete' : 'deleting'} experience ${doc.role} (not in the V7 résumé)`)
			if (!DRY_RUN) await payload.delete({ collection: 'experience', id: doc.id })
		}
	}
}

interface CopyProject {
	slug: string
	redirectFrom?: string[]
	order: number
	card: Json & { show: boolean }
	kicker: string
	title: string
	lede: string
	role: string
	timeline: string
	sector: string
	impact: Json[]
	challenge: string[]
	contributions: Json[]
	stack: string[]
	architecture?: Json
	hero: { path: string; image?: string; placeholder?: { label: string; spec: string } }
	gallery: { path: string; image?: string; placeholder?: { label: string; spec: string } }[]
}

const NEW_PROJECT_DATES: Record<string, string> = { intedat: '2024-09-01T00:00:00.000Z' }

async function findProject(slug: string): Promise<{ id: number; slug: string } | null> {
	const found = await payload.find({ collection: 'projects', where: { slug: { equals: slug } }, limit: 1, depth: 0, draft: true })
	return found.docs[0] ? { id: Number(found.docs[0].id), slug: found.docs[0].slug } : null
}

function projectData(project: CopyProject): Json {
	const card = project.card.show
		? {
				show: true,
				size: project.card.size,
				badge: project.card.badge ?? null,
				year: project.card.year,
				meta: project.card.meta,
				description: project.card.description,
				chips: project.card.chips,
				cta: 'readCaseStudy'
			}
		: { show: false }
	const architecture = project.architecture
		? {
				nodes: (project.architecture.nodes as Json[]).map(node => ({
					key: node.key,
					name: node.name,
					tech: node.tech,
					external: node.external === true
				})),
				edges: (project.architecture.edges as Json[]).map(edge => ({
					from: edge.from,
					to: edge.to,
					kind: edge.kind,
					bidirectional: edge.bidirectional === true,
					label: edge.label ?? null,
					labelShort: edge.labelShort ?? null
				})),
				legend: project.architecture.legend,
				observability: project.architecture.observability,
				caption: project.architecture.caption,
				textAlternative: project.architecture.textAlternative
			}
		: undefined
	return {
		slug: project.slug,
		order: project.order,
		layout: 'caseStudy',
		title: project.title,
		kicker: project.kicker,
		lede: project.lede,
		role: project.role,
		timeline: project.timeline,
		sector: project.sector,
		thumbnail: image(project.hero.image),
		heroPath: project.hero.path,
		heroPlaceholderLabel: project.hero.placeholder?.label ?? null,
		heroPlaceholderSpec: project.hero.placeholder?.spec ?? null,
		impact: project.impact.map(row => ({ label: row.label, value: row.value, sub: row.sub ?? null })),
		content: paragraphs(project.challenge),
		contributions: project.contributions.map(row => ({ title: row.title, body: row.body })),
		stack: project.stack,
		screens: project.gallery.map(row => ({
			image: image(row.image),
			path: row.path,
			placeholderLabel: row.placeholder?.label ?? null,
			placeholderSpec: row.placeholder?.spec ?? null
		})),
		...(architecture ? { architecture } : {}),
		card,
		_status: 'published'
	}
}

async function importProjects(): Promise<void> {
	const projects = pick<CopyProject[]>('en', 'collections.projects')
	const seeded = new Set<string>()

	for (const [index, project] of projects.entries()) {
		const target = (await findProject(project.slug)) ?? (await firstExisting(project.redirectFrom?.slice(0, 1) ?? []))
		const id = await writeDocument('projects', project.slug, target?.id ?? null, locale => {
			const localized = pick<CopyProject[]>(locale, 'collections.projects')[index]!
			const data = projectData(localized)
			return target ? data : { ...data, date: NEW_PROJECT_DATES[project.slug] ?? new Date().toISOString() }
		})
		if (id) seeded.add(String(id))
	}

	const others = await payload.find({ collection: 'projects', limit: 200, depth: 0, draft: false })
	for (const doc of others.docs.filter(doc => !seeded.has(String(doc.id)) && doc.card?.show !== false)) {
		await writeDocument('projects', doc.slug, Number(doc.id), () => ({ card: { show: false }, _status: 'published' }))
	}
}

async function firstExisting(paths: string[]): Promise<{ id: number; slug: string } | null> {
	for (const legacy of paths) {
		const found = await findProject(legacy.replace(/^\/projects\//, ''))
		if (found) return found
	}
	return null
}

async function importPostCover(): Promise<void> {
	const cover = image('post-traefik-cover')
	const found = await payload.find({ collection: 'posts', where: { slug: { like: 'traefik' } }, limit: 1, depth: 0, draft: false })
	const post = found.docs[0]
	if (!post || !cover) return
	await writeDocument('posts', post.slug, Number(post.id), () => ({ thumbnail: cover, _status: 'published' }))
}

async function importRedirects(): Promise<void> {
	const projects = pick<CopyProject[]>('en', 'collections.projects')
	const rows = projects.flatMap(project =>
		(project.redirectFrom ?? []).flatMap(from => [
			{ from, to: `/projects/${project.slug}` },
			{ from: `/cs${from}`, to: `/cs/projects/${project.slug}` }
		])
	)
	for (const row of rows) {
		const existing = await payload.find({ collection: 'redirects', where: { from: { equals: row.from } }, limit: 1, depth: 0 })
		const stored = existing.docs[0]
		if (!report(`redirect ${row.from}`, stored ? differences(stored, { ...row, permanent: true }) : ['(new redirect)'])) continue
		if (DRY_RUN) continue
		if (stored) await payload.update({ collection: 'redirects', id: stored.id, data: { ...row, permanent: true } })
		else await payload.create({ collection: 'redirects', data: { ...row, permanent: true } })
	}
}

// ---------------------------------------------------------------------------------------------- main

log(`${DRY_RUN ? 'dry run, nothing is written' : 'writing'} · copy ${COPY_DIR} · assets ${ASSETS_DIR}`)
await importMedia()
await importGlobals()
await importServices()
await importTestimonials()
await importExperience()
await importProjects()
await importPostCover()
await importRedirects()
log(`done · ${changed} ${DRY_RUN ? 'would change' : 'changed'} · ${unchanged} unchanged`)
process.exit(0)
