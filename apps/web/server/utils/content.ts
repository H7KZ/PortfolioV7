import type {
	BlogData,
	ContactData,
	ErrorsData,
	HomeData,
	LayoutData,
	LegalPage,
	Locale,
	PostData,
	PostSummary,
	ProjectCard,
	ProjectData,
	Resolved,
	ResumeData,
	TocItem
} from '#shared/types/content'
import type {
	Blog,
	Contact,
	ContactForm,
	Error as ErrorPage,
	Experience,
	Footer,
	Home,
	Navigation,
	Post,
	Privacy,
	Project,
	ProjectPage,
	Redirect,
	Resume,
	Service,
	Site,
	Term,
	Testimonial
} from '@portfolio/content'

const HEADING = /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/g

function slugify(text: string): string {
	return text
		.normalize('NFKD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

/** The CMS renders each code block's copy button with these markers, because the labels live in the blog global, not in the post. */
function withCodeLabels(html: string, copy: string | null | undefined, copied: string | null | undefined): string {
	if (!html.includes('%%copy%%')) return html
	if (!copy) return html.replace(/<button type="button" class="code-copy"[^>]*>%%copy%%<\/button>/g, '')
	return html.replaceAll('%%copy%%', escapeHtml(copy)).replaceAll('%%copied%%', escapeHtml(copied || copy))
}

function escapeHtml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Gives every h2 a stable id and lists them, so the contents box and the in-page links need nothing at render time. */
function withHeadingIds(html: string | null | undefined): { html: string; toc: TocItem[] } {
	const toc: TocItem[] = []
	const used = new Set<string>()
	const body = (html ?? '').replace(HEADING, (match, attributes: string | undefined, inner: string) => {
		const text = inner
			.replace(/<[^>]*>/g, '')
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/&#0?39;/g, "'")
			.replace(/\s+/g, ' ')
			.trim()
		if (!text) return match
		const existing = /\sid="([^"]+)"/.exec(attributes ?? '')?.[1]
		const base = existing ?? (slugify(text) || 'section')
		let id = base
		for (let n = 2; used.has(id); n++) id = `${base}-${n}`
		used.add(id)
		toc.push({ id, text })
		return existing ? match : `<h2 id="${id}"${attributes ?? ''}>${inner}</h2>`
	})
	return { html: body, toc }
}

interface ListResponse<T> {
	docs: T[]
	totalDocs: number
}

type GlobalSlug = 'site' | 'navigation' | 'footer' | 'home' | 'resume' | 'blog' | 'contact' | 'contact-form' | 'project-page' | 'errors' | 'privacy' | 'terms'
type CollectionSlug = 'projects' | 'posts' | 'experience' | 'testimonials' | 'services' | 'redirects'

interface Options {
	locale?: Locale
	draft?: boolean
	where?: Record<string, unknown>
	sort?: string
	limit?: number
}

const PUBLISHED = { _status: { equals: 'published' } }

async function global<T>(slug: GlobalSlug, { locale, draft }: Options): Promise<Resolved<T>> {
	const doc = await cmsFetch<T>(`/globals/${slug}`, { locale, draft: draft ? 'true' : undefined, depth: 1 })
	return resolve(doc) as Resolved<T>
}

async function list<T>(collection: CollectionSlug, { locale, draft, where, sort, limit }: Options, drafts = false): Promise<ListResponse<Resolved<T>>> {
	const filter = drafts && !draft ? { and: [PUBLISHED, ...(where ? [where] : [])] } : where
	const response = await cmsFetch<ListResponse<T>>(`/${collection}`, {
		locale,
		draft: draft ? 'true' : undefined,
		depth: 1,
		sort,
		limit: limit ?? 100,
		where: filter as never
	})
	return { docs: resolve(response.docs) as Resolved<T>[], totalDocs: response.totalDocs }
}

async function fetchRedirects(): Promise<Record<string, { to: string; permanent: boolean }>> {
	const redirects = await list<Redirect>('redirects', { limit: 1000 })
	return Object.fromEntries(redirects.docs.map(row => [row.from, { to: row.to, permanent: row.permanent !== false }]))
}

const loaders = {
	async layout(locale: Locale, draft: boolean): Promise<LayoutData> {
		const [site, navigation, footer] = await Promise.all([
			global<Site>('site', { locale, draft }),
			global<Navigation>('navigation', { locale, draft }),
			global<Footer>('footer', { locale, draft })
		])
		// The text files have their own routes; leaving them out keeps them out of every page payload.
		const { humansTxt: _humans, llmsTxt: _llms, llmsFullTxt: _llmsFull, ...pageSite } = site
		return { site: pageSite, navigation, footer }
	},

	async home(locale: Locale, draft: boolean): Promise<HomeData> {
		const [page, projects, services, testimonials] = await Promise.all([
			global<Home>('home', { locale, draft }),
			list<Project>('projects', { locale, draft, sort: 'order' }, true),
			list<Service>('services', { locale, draft, sort: 'order' }, true),
			list<Testimonial>('testimonials', { locale, draft, sort: 'order' }, true)
		])
		const cards: ProjectCard[] = projects.docs
			.filter(project => project.card?.show)
			.map(({ id, slug, title, date, thumbnail, heroPlaceholderLabel, heroPlaceholderSpec, card }) => ({
				id,
				slug,
				title,
				date,
				thumbnail,
				heroPlaceholderLabel,
				heroPlaceholderSpec,
				card
			}))
		// The V6 hidden summary is not shown since V7 (SPEC 8.4), so it stays out of the payload too.
		const { geoSummary: _geoSummary, ...homePage } = page
		return {
			page: homePage,
			projects: cards,
			projectCount: projects.totalDocs,
			testimonialCount: testimonials.totalDocs,
			services: services.docs,
			testimonials: testimonials.docs.filter(testimonial => testimonial.show !== false)
		}
	},

	async resume(locale: Locale, draft: boolean): Promise<ResumeData> {
		const [page, experience] = await Promise.all([
			global<Resume>('resume', { locale, draft }),
			list<Experience>('experience', { locale, draft, sort: 'order' }, true)
		])
		return { page, experience: experience.docs }
	},

	async blog(locale: Locale, draft: boolean): Promise<BlogData> {
		const [page, posts] = await Promise.all([global<Blog>('blog', { locale, draft }), list<Post>('posts', { locale, draft, sort: '-date' }, true)])
		const summaries: PostSummary[] = posts.docs.map(({ id, slug, title, date, description, tags, readingTime, thumbnail }) => ({
			id,
			slug,
			title,
			date,
			description,
			tags,
			readingTime,
			thumbnail
		}))
		return { page, posts: summaries }
	},

	async post(slug: string, locale: Locale, draft: boolean): Promise<PostData | null> {
		const [page, posts] = await Promise.all([
			global<Blog>('blog', { locale, draft }),
			list<Post>('posts', { locale, draft, where: { slug: { equals: slug } }, limit: 1 }, true)
		])
		const post = posts.docs[0]
		if (!post) return null
		const { html, toc } = withHeadingIds(post.contentHtml)
		return { page, post: { ...post, contentHtml: withCodeLabels(html, page.copyLabel, page.copiedLabel) }, toc }
	},

	async project(slug: string, locale: Locale, draft: boolean): Promise<ProjectData | null> {
		const [labels, projects, all, redirects] = await Promise.all([
			global<ProjectPage>('project-page', { locale, draft }),
			list<Project>('projects', { locale, draft, where: { slug: { equals: slug } }, limit: 1 }, true),
			list<Project>('projects', { locale, draft, sort: 'order' }, true),
			fetchRedirects()
		])
		const project = projects.docs[0]
		if (!project) return null
		// Archived V6 projects have no kicker and are never linked, so the case study sequence skips them, as it does redirected slugs.
		const sequence = all.docs.filter(doc => doc.kicker && !redirects[`/projects/${doc.slug}`])
		const index = sequence.findIndex(doc => doc.slug === slug)
		const following = sequence.length > 1 ? sequence[(index + 1) % sequence.length] : undefined
		return { labels, project, next: following && following.slug !== slug ? { slug: following.slug, title: following.title } : null }
	},

	async contact(locale: Locale, draft: boolean): Promise<ContactData> {
		const [page, form] = await Promise.all([global<Contact>('contact', { locale, draft }), global<ContactForm>('contact-form', { locale, draft })])
		return { page, form }
	},

	async legal(slug: 'privacy' | 'terms', locale: Locale, draft: boolean): Promise<LegalPage> {
		const page = slug === 'privacy' ? await global<Privacy>('privacy', { locale, draft }) : await global<Term>('terms', { locale, draft })
		const { html, toc } = withHeadingIds(page.contentHtml)
		return { ...page, contentHtml: html, toc }
	},

	async errors(locale: Locale, draft: boolean): Promise<ErrorsData> {
		return global<ErrorPage>('errors', { locale, draft })
	},

	redirects: fetchRedirects,

	async feed(): Promise<{ blog: Resolved<Blog>; site: Resolved<Site>; posts: Resolved<Post>[] }> {
		const [blog, site, posts] = await Promise.all([
			global<Blog>('blog', { locale: 'en' }),
			global<Site>('site', { locale: 'en' }),
			list<Post>('posts', { locale: 'en', sort: '-date' }, true)
		])
		return { blog, site, posts: posts.docs }
	},

	async sitemap(): Promise<{ projects: { slug: string; updatedAt: string }[]; posts: { slug: string; updatedAt: string }[] }> {
		const [projects, posts, redirects] = await Promise.all([
			list<Project>('projects', { locale: 'en', sort: 'order' }, true),
			list<Post>('posts', { locale: 'en', sort: '-date' }, true),
			fetchRedirects()
		])
		return {
			projects: projects.docs.filter(({ slug }) => !redirects[`/projects/${slug}`]).map(({ slug, updatedAt }) => ({ slug, updatedAt })),
			posts: posts.docs.map(({ slug, updatedAt }) => ({ slug, updatedAt }))
		}
	},

	async cv(): Promise<string | null> {
		const resume = await global<Resume>('resume', { locale: 'en' })
		return typeof resume.cv === 'object' && resume.cv ? (resume.cv.filename ?? null) : null
	},

	async site(): Promise<Resolved<Site>> {
		return global<Site>('site', { locale: 'en' })
	}
}

type Loaders = typeof loaders

const CACHE_OPTIONS = { base: 'content', maxAge: 60 * 60 * 24, swr: true, staleMaxAge: -1 }

const cachedLoaders = Object.fromEntries(
	Object.entries(loaders).map(([name, loader]) => [
		name,
		defineCachedFunction(loader as (...args: unknown[]) => Promise<unknown>, {
			...CACHE_OPTIONS,
			name,
			getKey: (...args: unknown[]) => args.map(String).join(':') || 'default'
		})
	])
) as unknown as Loaders

/** Published content through the cache; drafts (preview) always bypass it. */
export function content(event?: import('h3').H3Event): Loaders {
	return event && isPreview(event) ? loaders : cachedLoaders
}

export function isDraft(event: import('h3').H3Event): boolean {
	return isPreview(event)
}

export async function clearContentCache(): Promise<void> {
	await useStorage('content').clear()
}
