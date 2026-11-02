/**
 * Writes the V7 redesign copy and images into Payload.
 *
 *   pnpm --filter @portfolio/cms run seed:v7 [-- --dry-run]
 *
 * The `--` matters: without it the flag does not reach this script and the run writes.
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
import { createLocalReq, getPayload, type Payload } from 'payload'
import config from '../src/payload.config'
import { renderRichText } from '../src/rich-text/render'

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
	'deeptrace-hero-hd': {
		en: 'DeepTrace lineage view: a flood extent product traced back through processing steps to a raw satellite downlink, with a trust mark per organization and one untrusted source flagged, demo data',
		cs: 'Pohled DeepTrace na původ dat: produkt mapy záplav vysledovaný přes kroky zpracování až k surovým datům ze satelitu, s označením důvěry u každé organizace a jedním nedůvěryhodným zdrojem, ukázková data'
	},
	'deeptrace-hashchain-hd': {
		en: 'DeepTrace hash-chain view: a file trace verified from block 407 up to reference block 412 against its SHA-512 hash, every link marked as passed, demo data',
		cs: 'Pohled DeepTrace na řetězec hashů: záznam souboru ověřený od bloku 407 po referenční blok 412 proti hashi SHA-512, každý článek označený jako ověřený, ukázková data'
	},
	'deeptrace-sources-hd': {
		en: 'DeepTrace table of trusted data sources: organizations with the options trust as origin and require signed ancestors, demo data',
		cs: 'Tabulka důvěryhodných zdrojů dat v DeepTrace: organizace s volbami důvěry jako původce a vyžadování podepsaných předků, ukázková data'
	},
	'deeptrace-verify-hd': {
		en: 'Two DeepTrace hash-chain checks side by side: every block passes on the left, tampered block 411 is flagged on the right, demo data',
		cs: 'Dvě kontroly řetězce hashů v DeepTrace vedle sebe: vlevo projdou všechny bloky, vpravo je označený pozměněný blok 411, ukázková data'
	},
	'ohlidame-hero-hd': {
		en: 'Ohlídáme home page: a free e-shop check with an address field next to a sample result listing four tasks with their Czech law paragraphs and a fix',
		cs: 'Úvodní stránka Ohlídáme: bezplatná kontrola e-shopu s polem pro adresu vedle ukázky výsledku se čtyřmi úkoly, paragrafy a postupem opravy'
	},
	'ohlidame-report-hd': {
		en: 'Ohlídáme report of a fictional test shop: one thing left to fix, a bar of passed and waiting checks, and questions about how the shop sells',
		cs: 'Výsledek Ohlídáme pro smyšlený testovací e-shop: zbývá jedna věc k opravě, pruh hotových a čekajících kontrol a otázky, jak e-shop prodává'
	},
	'ohlidame-scope-hd': {
		en: 'Ohlídáme report panel listing the pages it read, the product sample and what it could not reach, with the reason for each',
		cs: 'Panel výsledku Ohlídáme se seznamem načtených stránek, vzorkem produktů a tím, co se nepodařilo získat, u každé položky s důvodem'
	},
	'ohlidame-deep-hd': {
		en: 'Ohlídáme offer for the 490 CZK deep check: 70 products instead of 20, with a comparison table of the free and deep check',
		cs: 'Nabídka hlubší kontroly Ohlídáme za 490 Kč: 70 produktů místo 20 a tabulka porovnání bezplatné a hlubší kontroly'
	},
	'ohlidame-progress-hd': {
		en: 'Ohlídáme scan in progress with seven steps, from preparing a safe scan through reading legal pages to the result',
		cs: 'Probíhající kontrola Ohlídáme se sedmi kroky, od přípravy bezpečné kontroly přes čtení právních stránek po výsledek'
	},
	'ohlidame-guides-hd': {
		en: 'Ohlídáme public guide for e-shops: a list of Czech obligations such as the 30-day discount rule and the withdrawal button',
		cs: 'Veřejná příručka Ohlídáme pro e-shopy: seznam povinností, například pravidlo 30 dnů u slev a tlačítko pro odstoupení'
	},
	'ohlidame-shop-hd': {
		en: 'Fictional test e-shop used to exercise Ohlídáme, labelled as selling nothing, with a list of made-up paper machines',
		cs: 'Smyšlený testovací e-shop pro ověřování Ohlídáme, označený jako nic neprodávající, se seznamem vymyšlených papírových strojů'
	},
	'iont-photos-hd': {
		en: 'Three installed IONT chargers: an e:car charging post, a smaller e:car unit in a garden and a wall-mounted e:bike charger',
		cs: 'Tři nainstalované nabíječky IONT: stojan e:car, menší jednotka e:car v zahradě a nástěnná nabíječka e:bike'
	},
	'kreditozrouti-usage-hd': {
		en: 'Umami dashboard of Kreditožrouti: 589 visitors, 783 visits, 2.14k views, 13% bounce rate and monthly bars from June to October',
		cs: 'Přehled Umami pro Kreditožrouty: 589 návštěvníků, 783 návštěv, 2,14 tis. zobrazení, 13 % míra okamžitého opuštění a měsíční sloupce od června do října'
	},
	'scorecard-report-hd': {
		en: 'Two pages of an exported Scorecard PDF: the compliance overview with charts and the cyber-risk treatment table, demo data',
		cs: 'Dvě strany PDF exportovaného ze Scorecard: přehled shody s grafy a tabulka opatření proti kybernetickým rizikům, ukázková data'
	},
	'iont-landing-hd': {
		en: 'IONT landing page introducing the public EV charging network',
		cs: 'Úvodní stránka IONT představující veřejnou síť nabíječek pro elektromobily'
	},
	'iont-phones-hd': {
		en: 'Three phones with the IONT driver app: finding a charger, paying and following a live charging session',
		cs: 'Tři telefony s aplikací IONT: hledání nabíječky, platba a průběh nabíjení v reálném čase'
	},
	'iont-charge-hd': {
		en: 'IONT charge screen with the live session: energy delivered, time and price',
		cs: 'Obrazovka nabíjení IONT s probíhající relací: dodaná energie, čas a cena'
	},
	'iont-admin-hd': {
		en: 'IONT admin panel running on the charger, with configuration and diagnostics',
		cs: 'Administrace IONT běžící přímo v nabíječce, s nastavením a diagnostikou'
	},
	'iont-hero-hd': {
		en: 'Three phones with the IONT app: the profile menu, a charger device card and its settings',
		cs: 'Tři telefony s aplikací IONT: nabídka profilu, karta nabíječky a její nastavení'
	},
	'iont-driver-hd': {
		en: 'Four phone screens of the IONT charger app: a live charging session, two connectors at once, RFID cards and timers',
		cs: 'Čtyři obrazovky aplikace IONT pro nabíječku: probíhající nabíjení, dvě zásuvky najednou, karty RFID a časovače'
	},
	'iont-panel-hd': {
		en: 'IONT admin panel: the charger pairing screen with its code next to two phone screens with charger status and settings',
		cs: 'Administrace IONT: párování nabíječky s kódem vedle dvou obrazovek telefonu se stavem a nastavením nabíječky'
	},
	'kreditozrouti-timetable-hd': {
		en: 'Kreditožrouti week timetable with seven courses and one conflict, lecturer names hidden',
		cs: 'Týdenní rozvrh v Kreditožroutech se sedmi předměty a jednou kolizí, jména vyučujících jsou skrytá'
	},
	'kreditozrouti-search-hd': {
		en: 'Kreditožrouti course list with faculty, ECTS and schedule columns next to the filters',
		cs: 'Seznam předmětů v Kreditožroutech se sloupci fakulta, ECTS a rozvrh vedle filtrů'
	},
	'disenchantment-world-hd': {
		en: 'Minecraft library with an anvil and an enchanting table among bookshelves, with enchanted swords, tools and books on display',
		cs: 'Knihovna v Minecraftu s kovadlinou a očarovacím stolem mezi regály, kolem vystavené očarované meče, nástroje a knihy'
	},
	'disenchantment-compare-hd': {
		en: 'Two anvil screens side by side: vanilla Minecraft refuses a sword and a book, with Disenchantment the anvil offers an enchanted book holding all five enchantments of the sword for 18 levels',
		cs: 'Dvě obrazovky kovadliny vedle sebe: vanilla Minecraft meč a knihu odmítne, s Disenchantment kovadlina nabídne očarovanou knihu se všemi pěti očarováními meče za 18 úrovní'
	},
	'disenchantment-anvil-hd': {
		en: 'Anvil screen with Disenchantment: a sword and books in the input slots and an enchanted book with Mending as the result for 15 levels',
		cs: 'Obrazovka kovadliny s Disenchantment: meč a knihy ve vstupních polích a očarovaná kniha s Mending jako výsledek za 15 úrovní'
	},
	'disenchantment-gui-hd': {
		en: 'Disenchantment admin GUI listing enchantments, with a tooltip showing Looting set to keep on disenchant and enabled on shatter',
		cs: 'Administrátorské GUI Disenchantment se seznamem očarování a popiskem, že se Looting při odčarování ponechá a při rozdělení je povolený'
	},
	'disenchantment-repo-hd': {
		en: 'GitHub repository of Disenchantment with its files, stars, forks and releases',
		cs: 'Repozitář Disenchantment na GitHubu se soubory, hvězdičkami, forky a vydáními'
	},
	'kreditozrouti-dark-hd': {
		en: 'Kreditožrouti in dark mode: the first step of the study plan wizard, choosing a faculty',
		cs: 'Kreditožrouti v tmavém režimu: první krok průvodce studijním plánem, výběr fakulty'
	},
	'kreditozrouti-desktop-hd': {
		en: 'Kreditožrouti in light mode: the first step of the study plan wizard, choosing a faculty',
		cs: 'Kreditožrouti ve světlém režimu: první krok průvodce studijním plánem, výběr fakulty'
	},
	'kreditozrouti-mobile': {
		en: 'Kreditožrouti on a phone, showing the day view of a timetable',
		cs: 'Kreditožrouti v telefonu s denním pohledem na rozvrh'
	},
	'intedat-tasks-hd': {
		en: 'Intedat task list: companies with status, contact person and next contact date, next to filters for status, date and location, demo data',
		cs: 'Seznam úkolů v Intedatu: firmy se stavem, kontaktní osobou a termínem dalšího kontaktu vedle filtrů podle stavu, data a lokality, ukázková data'
	},
	'intedat-global-search-hd': {
		en: 'Intedat global search for logistics: matching companies and contact people with the term highlighted in each result, demo data',
		cs: 'Globální vyhledávání v Intedatu pro výraz logistics: nalezené firmy a kontaktní osoby se zvýrazněným výrazem, ukázková data'
	},
	'intedat-company-hd': {
		en: 'Intedat company detail: contact persons, the next meeting, activity buttons and the history of previous activities, demo data',
		cs: 'Detail firmy v Intedatu: kontaktní osoby, plánovaná schůzka, tlačítka aktivit a historie předchozích aktivit, ukázková data'
	},
	'scorecard-thumbnail-hd': {
		en: 'Scorecard table of risk treatments with deadline, function status, scope status and owner, filled with demo data',
		cs: 'Tabulka opatření ve Scorecard s termínem, stavem funkce, stavem rozsahu a vlastníkem, vyplněná ukázkovými daty'
	},
	'scorecard-main-hd': {
		en: 'Scorecard dashboard: overall compliance, compliance by treatment parameter and treatments planned by deadline, above the treatment table',
		cs: 'Přehled Scorecard: celková shoda, shoda podle parametrů opatření a opatření plánovaná podle termínu nad tabulkou opatření'
	},
	portrait: {
		en: 'Jan Komínek, smiling, in glasses and a white shirt, cut out from his background',
		cs: 'Jan Komínek s úsměvem, v brýlích a bílé košili, vystřižený z pozadí'
	},
	'portrait-resume': {
		en: 'Jan Komínek sitting in the snow in a cap and backpack, with a dog next to him',
		cs: 'Jan Komínek sedí ve sněhu v čepici a s batohem, vedle něj pes'
	},
	'post-traefik-cover': {
		en: 'Cloudflare form for creating an API token with the Zone DNS Edit permission for one zone and a client IP filter',
		cs: 'Formulář Cloudflare pro vytvoření API tokenu s oprávněním Zone DNS Edit pro jednu zónu a filtrem IP adres klienta'
	}
}

/** Alt text of the two screenshots inside the Traefik post, whose media came from V6 with the post title as alt. */
const TRAEFIK_IMAGE_ALT: Record<string, Record<Locale, string>> = {
	'posts-traefik_with_cloudflare_inside_docker_simplified-image-1.webp': {
		en: 'Cloudflare API token form: Zone DNS Edit permission, one zone, client IP filter',
		cs: 'Formulář Cloudflare pro API token: oprávnění Zone DNS Edit, jedna zóna, filtr IP adres klienta'
	},
	'posts-traefik_with_cloudflare_inside_docker_simplified-image_2-1.webp': {
		en: 'Cloudflare API token form: Zone Zone Read permission, one zone, client IP filter',
		cs: 'Formulář Cloudflare pro API token: oprávnění Zone Zone Read, jedna zóna, filtr IP adres klienta'
	}
}

/** Strings the design needs that the copy JSON does not carry yet. */
const EXTRA: Record<Locale, { homeTitle: string; navLabel: string; newTabLabel: string; primarySkillLabel: string; personDescription: string }> = {
	en: {
		homeTitle: 'Jan Komínek · Fullstack Engineer · Prague',
		navLabel: 'Main navigation',
		newTabLabel: '(opens in a new tab)',
		primarySkillLabel: '(daily)',
		personDescription:
			'Freelance fullstack engineer based in Prague, Czech Republic. Takes products from an empty repository to production with TypeScript, Vue, React, Node.js, PostgreSQL and Docker. Seven companies since 2022; creates and runs Kreditožrouti, a live course scheduler. Available for part-time B2B work, around 10 hours a week, hybrid in Prague or fully remote. Not the Czech actor of the same name.'
	},
	cs: {
		homeTitle: 'Jan Komínek · Fullstack Engineer · Praha',
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
/** Czech typography: a one-letter word stays with the next word, and a number with its unit. */
function czechSpaces(text: string): string {
	return text.replace(/(?<=^|[\s(„])([ksvzouaiKSVZOUAI]) (?=\S)/g, '$1 ').replace(/(\d) (Kč|%|min|km|kW|GB|MB)(?![\p{L}])/gu, '$1 $2')
}

function withCzechSpaces<T>(value: T): T {
	if (typeof value === 'string') return czechSpaces(value) as T
	if (Array.isArray(value)) return value.map(withCzechSpaces) as T
	if (typeof value !== 'object' || value === null) return value
	return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, withCzechSpaces(nested)])) as T
}

const copy: Record<Locale, Json> = {
	en: JSON.parse(await fs.readFile(path.join(COPY_DIR, 'copy.en.json'), 'utf8')),
	cs: withCzechSpaces(JSON.parse(await fs.readFile(path.join(COPY_DIR, 'copy.cs.json'), 'utf8')))
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
			webp800: has(`${asset.name}-800.webp`) ? `${asset.name}-800.webp` : null,
			avif1600: has(`${asset.name}-1600.avif`) ? `${asset.name}-1600.avif` : null,
			webp1600: has(`${asset.name}-1600.webp`) ? `${asset.name}-1600.webp` : null
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

/** SEO titles reuse the navigation labels; the site appends the name, so "Résumé" becomes "Résumé · Jan Komínek". */
function navLabel(locale: Locale, href: string): string {
	const navigation = pick<Json>(locale, 'globals.navigation')
	const items = [...(navigation.items as Link[]), ...((navigation.mobileMenu as Json).extraItems as Link[])]
	const item = items.find(entry => entry.href === href)
	if (!item) throw new Error(`navigation has no ${href}`)
	return item.label
}

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
				eyebrowCommandShort: hero.eyebrowCommandShort,
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
				allRecommendationsLabel: testimonials.allRecommendationsLabel,
				allRecommendationsUrl: testimonials.allRecommendationsUrl,
				quoteLimit: testimonials.quoteLimit,
				meta: { title: EXTRA[locale].homeTitle, description: hero.valueProp }
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
				meta: { title: navLabel(locale, '/resume'), description: resume.bio },
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
		return { ...contact, meta: { title: navLabel(locale, '/contact'), description: contact.intro } }
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
		return { ...blog, meta: { title: navLabel(locale, '/blog'), description: blog.lead } }
	})

	// updatedAt is the real date of the last edit and stays as it is; only the wording around it is seeded.
	for (const slug of ['privacy', 'terms'] as const) {
		await writeGlobal(
			slug,
			locale => {
				const page = pick<Json>(locale, `globals.${slug}`)
				return {
					label: page.label,
					title: page.title,
					updatedLabel: page.updatedLabel,
					bindingNote: page.bindingNote,
					tocLabel: page.tocLabel,
					meta: { description: page.metaDescription }
				}
			},
			true
		)
	}

	const siteUrl = String(((await payload.findGlobal({ slug: 'site', depth: 0 })) as unknown as Json).siteUrl ?? 'https://jankominek.com').replace(/\/$/, '')
	const texts = llmsTexts(siteUrl)
	await writeGlobal('site', locale => {
		const resume = pick<Json>(locale, 'globals.resume')
		const skills = (resume.skillGroups as { skills: string[] }[]).flatMap(group => group.skills.filter(skill => skill.endsWith('*')))
		return {
			llmsTxt: texts.short,
			llmsFullTxt: texts.full,
			newTabLabel: EXTRA[locale].newTabLabel,
			jobTitle: 'Fullstack Engineer',
			personDescription: EXTRA[locale].personDescription,
			description: EXTRA[locale].personDescription,
			sameAs: ['https://www.linkedin.com/in/jan-kominek', 'https://github.com/H7KZ'],
			knowsAbout: skills.map(skill => skill.replace(/\*$/, ''))
		}
	})
}

/** /llms.txt and /llms-full.txt, built from the English copy so they say what the site says. */
function llmsTexts(siteUrl: string): { short: string; full: string } {
	const home = pick<Json>('en', 'globals.home')
	const hero = home.hero as Json
	const resume = pick<Json>('en', 'globals.resume')
	const contact = pick<Json>('en', 'globals.contact')
	const blog = pick<Json>('en', 'globals.blog')
	const projects = pick<CopyProject[]>('en', 'collections.projects')
	const experience = pick<Record<string, Json[]>>('en', 'collections.experience')
	const skills = (resume.skillGroups as { title: string; skills: string[] }[]).map(
		group => `${group.title}: ${group.skills.map(skill => skill.replace(/\*$/, '')).join(', ')}`
	)
	const name = (title: string) => title.replace(/\.$/, '')

	const head = [
		'# Jan Komínek · Fullstack Engineer',
		'',
		`> ${EXTRA.en.personDescription}`,
		'',
		String(hero.valueProp),
		'',
		'## Key pages',
		'',
		`- [Home](${siteUrl}/): ${String(hero.headline).replace(/\n/g, ' ')}`,
		`- [Résumé](${siteUrl}/resume): ${resume.bio}`,
		`- [Contact](${siteUrl}/contact): ${contact.intro}`,
		`- [Blog](${siteUrl}/blog): ${blog.lead}`,
		'',
		'## Case studies',
		'',
		...projects.map(project => `- [${name(project.title)}](${siteUrl}/projects/${project.slug}): ${project.lede}`),
		'',
		'## Profiles',
		'',
		'- [LinkedIn](https://www.linkedin.com/in/jan-kominek)',
		'- [GitHub](https://github.com/H7KZ)',
		'',
		'## Stack',
		'',
		...skills.map(line => `- ${line}`),
		'',
		'## Availability',
		'',
		String(contact.intro),
		''
	]

	const details = projects.flatMap(project => [
		`### ${name(project.title)}`,
		'',
		`${project.kicker} · ${project.role} · ${project.timeline} · ${project.sector}`,
		'',
		...project.challenge.flatMap(paragraph => [paragraph, '']),
		...project.contributions.map(item => `- ${item.title}: ${item.body}`),
		'',
		`Stack: ${project.stack.join(', ')}`,
		''
	])
	const timeline = Object.values(experience)
		.flat()
		.flatMap(entry => [
			`### ${entry.role} · ${entry.organization}`,
			'',
			`${entry.dates}${entry.duration ? ` · ${entry.duration}` : ''}`,
			'',
			...(entry.description ? [String(entry.description), ''] : []),
			...((entry.highlights as string[] | undefined) ?? []).map(text => `- ${text}`),
			''
		])

	return {
		short: head.join('\n'),
		full: [...head, '## Case study details', '', ...details, '## Experience', '', ...timeline].join('\n')
	}
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
				linkedinUrl: pick<string>(locale, 'globals.home.testimonials.allRecommendationsUrl'),
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
	gallery: { path: string; image?: string; crop?: 'default' | 'strip'; placeholder?: { label: string; spec: string } }[]
}

const NEW_PROJECT_DATES: Record<string, string> = { intedat: '2024-09-01T00:00:00.000Z', ohlidame: '2026-08-26T00:00:00.000Z' }

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
			crop: row.crop ?? 'default',
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

async function importPostImageAlts(): Promise<void> {
	for (const [filename, alt] of Object.entries(TRAEFIK_IMAGE_ALT)) {
		const id = await findMedia(filename)
		if (id) await writeDocument('media', filename, id, locale => ({ alt: alt[locale] }))
	}
}

async function importPostCover(): Promise<void> {
	const cover = image('post-traefik-cover')
	const found = await payload.find({ collection: 'posts', where: { slug: { like: 'traefik' } }, limit: 1, depth: 0, draft: false })
	const post = found.docs[0]
	if (!post || !cover) return
	await writeDocument('posts', post.slug, Number(post.id), () => ({ thumbnail: cover, _status: 'published' }))
}

/** Em dashes in the Traefik post, replaced by the punctuation an editor would pick. Exact fragments, so a second run finds nothing to change. */
const TRAEFIK_FIXES: [string | RegExp, string][] = [
	["wildcard TLS \u2014 even behind Cloudflare's proxy \u2014 with zero", "wildcard TLS, even behind Cloudflare's proxy, with zero"],
	[' \u2014 a single cert covering every subdomain \u2014 requires', ', a single cert covering every subdomain, requires'],
	["doesn't care \u2014 it reads", "doesn't care: it reads"],
	[/^Step (\d) \u2014 /, 'Step $1: '],
	[/^Token (\d) \u2014 /, 'Token $1: '],
	['zone ID \u2014 required to know', 'zone ID, required to know'],
	[' \u2014 Docker Compose interpolates', '. Docker Compose interpolates'],
	['gets a route \u2014 usually not what you want', 'gets a route, which is usually not what you want'],
	[' \u2014 5 failed validations', ': 5 failed validations'],
	[
		"security improvement \u2014 Traefik reads events but can't control containers",
		"security improvement, since Traefik reads events but can't control containers"
	],
	[' is just a unique identifier \u2014 it needs', ' is just a unique identifier: it needs'],
	[" \u2014 you'll see the challenge", ": you'll see the challenge"],
	['as the prefix \u2014 ', 'as the prefix: '],
	['within seconds \u2014 cert included', 'within seconds, cert included'],
	['# Read-only \u2014 Traefik only needs', '# Read-only. Traefik only needs'],
	["# Persisted cert storage \u2014 don't delete between restarts", "# Persisted cert storage. Don't delete between restarts"],
	['# Dashboard \u2014 routed to its own subdomain', '# Dashboard, routed to its own subdomain'],
	['wildcard TLS \u2014 all inside Docker Compose', 'wildcard TLS, all inside Docker Compose']
]

/** Figma's window label for the Traefik post's code blocks, matched by the first line of the code. Blocks the design does not show keep the language as their label. */
const TRAEFIK_FILENAMES: [string, string][] = [
	['CF_API_EMAIL=', '~/traefik/.env'],
	['docker network create public', 'terminal'],
	['networks:\n    public:', '~/traefik/docker-compose.yml']
]

function setFilenames(node: unknown): void {
	if (Array.isArray(node)) return node.forEach(setFilenames)
	if (!isObject(node)) return
	const fields = node.fields
	if (node.type === 'block' && isObject(fields) && fields.blockType === 'Code' && typeof fields.code === 'string') {
		const code = fields.code
		const match = TRAEFIK_FILENAMES.find(([start]) => code.startsWith(start))
		if (match) fields.filename = match[1]
	}
	Object.values(node).forEach(setFilenames)
}

function fixDashes(value: string): string {
	let out = value.replace(/◆\s*/g, '')
	for (const [from, to] of TRAEFIK_FIXES) out = typeof from === 'string' ? out.split(from).join(to) : out.replace(from, to)
	return out
}

function cleanTree(node: unknown): unknown {
	if (Array.isArray(node)) return node.map(cleanTree)
	if (typeof node === 'string') return fixDashes(node)
	if (!isObject(node)) return node
	return Object.fromEntries(
		Object.entries(node).map(([key, value]) => [key, ['id', 'type', 'format', 'tag', 'blockType'].includes(key) ? value : cleanTree(value)])
	)
}

async function importPostText(): Promise<void> {
	const found = await payload.find({ collection: 'posts', where: { slug: { like: 'traefik' } }, limit: 1, depth: 0, draft: false, locale: 'en' })
	const post = found.docs[0]
	if (!post) return
	const content = cleanTree(post.content)
	setFilenames(content)
	const description = fixDashes(post.description ?? '')
	if (JSON.stringify([content, description]).includes('\u2014'))
		throw new Error(
			'Em dashes are left in the Traefik post, add them to TRAEFIK_FIXES: ' +
				JSON.stringify([content, description])
					.match(/.{0,40}\u2014.{0,40}/g)
					?.join(' / ')
		)
	const diff = [
		...(JSON.stringify(content) === JSON.stringify(post.content) ? [] : ['content (em dashes, code file names)']),
		...(description === (post.description ?? '') ? [] : ['description (em dash)'])
	]
	if (!report(`posts/${post.slug} text [en]`, diff) || DRY_RUN) return
	// Only English is written: the post has no Czech copy and the site falls back to English for it.
	await payload.update({ collection: 'posts', id: post.id, locale: 'en', data: { content: content as never, description, _status: 'published' }, depth: 0 })
}

/**
 * The HTML of a post is rendered when it is saved, so a change to the renderer (code block markup, colors) only reaches a post that is saved again.
 * Saving would also publish drafts, add versions and re-encode link URLs, and reading through the API re-encodes them too, so the stored content is read
 * and the stored HTML replaced in SQL.
 */
async function renderPosts(): Promise<void> {
	const req = await createLocalReq({}, payload)
	const pool = (payload.db as unknown as { pool: { query(sql: string, values?: unknown[]): Promise<{ rows: Json[] }> } }).pool
	const { rows } = await pool.query(
		"select p.id, p.slug, l.content, l.content_html from posts p join posts_locales l on l._parent_id = p.id where l._locale = 'en' and l.content is not null order by p.id"
	)
	for (const row of rows) {
		const html = await renderRichText(row.content as never, req)
		if (!report(`posts/${row.slug} html [en]`, html === (row.content_html ?? '') ? [] : ['contentHtml'])) continue
		if (!DRY_RUN) await pool.query("update posts_locales set content_html = $1 where _parent_id = $2 and _locale = 'en'", [html, row.id])
	}
}

/** Posts written for V7. The body is `docs/redesign/content/posts/<slug>.<locale>.md`. */
const V7_POSTS: {
	slug: string
	date: string
	readingTime: number
	tags: string[]
	thumbnail: string
	title: Record<Locale, string>
	description: Record<Locale, string>
}[] = [
	{
		slug: 'ohlidame_61_days_with_ai_agents',
		date: '2026-11-01T00:00:00.000Z',
		readingTime: 6,
		tags: ['AI agents', 'SaaS', 'Infrastructure'],
		thumbnail: 'ohlidame-hero-hd',
		title: {
			en: '61 days to production: building a compliance SaaS with AI agents',
			cs: '61 dní do produkce: SaaS na kontrolu e-shopů postavený s AI agenty'
		},
		description: {
			en: 'How I took Ohlídáme from first commit to production alone with AI agents: the problem, the guardrails, the infrastructure and what went wrong.',
			cs: 'Jak jsem Ohlídáme dovedl od prvního commitu do produkce sám s AI agenty: problém, mantinely, infrastruktura a co se nepovedlo.'
		}
	}
]

async function importV7Posts(): Promise<void> {
	for (const post of V7_POSTS) {
		const found = await payload.find({ collection: 'posts', where: { slug: { equals: post.slug } }, limit: 1, depth: 0, draft: false })
		const bodies = {
			en: await fs.readFile(path.join(COPY_DIR, 'posts', `${post.slug}.en.md`), 'utf8'),
			cs: czechSpaces(await fs.readFile(path.join(COPY_DIR, 'posts', `${post.slug}.cs.md`), 'utf8'))
		}
		await writeDocument('posts', post.slug, found.docs[0] ? Number(found.docs[0].id) : null, locale => ({
			slug: post.slug,
			date: post.date,
			readingTime: post.readingTime,
			tags: post.tags,
			thumbnail: image(post.thumbnail),
			title: locale === 'cs' ? czechSpaces(post.title.cs) : post.title.en,
			description: locale === 'cs' ? czechSpaces(post.description.cs) : post.description.en,
			content: convertMarkdownToLexical({ editorConfig, markdown: bodies[locale].trim() }),
			_status: 'published'
		}))
	}
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
await importPostImageAlts()
await importPostText()
await importV7Posts()
await renderPosts()
await importRedirects()
log(`done · ${changed} ${DRY_RUN ? 'would change' : 'changed'} · ${unchanged} unchanged`)
process.exit(0)
