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
	ResumeData
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
		const summaries: PostSummary[] = posts.docs.map(({ id, slug, title, date, description, tags, readingTime }) => ({
			id,
			slug,
			title,
			date,
			description,
			tags,
			readingTime
		}))
		return { page, posts: summaries }
	},

	async post(slug: string, locale: Locale, draft: boolean): Promise<PostData | null> {
		const [page, posts] = await Promise.all([
			global<Blog>('blog', { locale, draft }),
			list<Post>('posts', { locale, draft, where: { slug: { equals: slug } }, limit: 1 }, true)
		])
		const post = posts.docs[0]
		return post ? { page, post } : null
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
		return slug === 'privacy' ? global<Privacy>('privacy', { locale, draft }) : global<Term>('terms', { locale, draft })
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
