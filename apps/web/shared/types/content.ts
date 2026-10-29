import type {
	Blog,
	Contact,
	ContactForm,
	Error as ErrorPage,
	Experience,
	Footer,
	Home,
	Media,
	Navigation,
	Post,
	Privacy,
	Project,
	ProjectPage,
	Resume,
	Service,
	Site,
	Term,
	Testimonial
} from '@portfolio/content'

export type Locale = 'en' | 'cs'

export interface MediaView {
	url: string
	filename: string
	alt: string
	mimeType: string | null
	width: number | null
	height: number | null
	/** Other encodings uploaded next to the file, as site URLs. */
	formats: { avif: string | null; avif800: string | null; webp800: string | null }
}

type IsMedia<T> = [T] extends [Media] ? ([Media] extends [T] ? true : false) : false

export type Resolved<T> = T extends unknown ? ResolvedMember<T> : never

type ResolvedMember<T> =
	IsMedia<T> extends true
		? MediaView
		: T extends (infer U)[]
			? Resolved<U>[]
			: T extends object
				? { [K in keyof T as K extends 'content' ? never : K]: Resolved<T[K]> }
				: T

export type Relation = number | MediaView | null | undefined

export interface LayoutData {
	site: Omit<Resolved<Site>, 'humansTxt' | 'llmsTxt' | 'llmsFullTxt'>
	navigation: Resolved<Navigation>
	footer: Resolved<Footer>
}

export type ProjectCard = Pick<Resolved<Project>, 'id' | 'slug' | 'title' | 'date' | 'thumbnail' | 'heroPlaceholderLabel' | 'heroPlaceholderSpec' | 'card'>

export interface HomeData {
	page: Omit<Resolved<Home>, 'geoSummary'>
	projects: ProjectCard[]
	projectCount: number
	services: Resolved<Service>[]
	testimonials: Resolved<Testimonial>[]
}

export interface ResumeData {
	page: Resolved<Resume>
	experience: Resolved<Experience>[]
}

export type PostSummary = Pick<Resolved<Post>, 'id' | 'slug' | 'title' | 'date' | 'description' | 'tags' | 'readingTime'>

export interface BlogData {
	page: Resolved<Blog>
	posts: PostSummary[]
}

export interface PostData {
	page: Resolved<Blog>
	post: Resolved<Post>
}

export interface ProjectData {
	labels: Resolved<ProjectPage>
	project: Resolved<Project>
	next: { slug: string; title: string } | null
}

export interface ContactData {
	page: Resolved<Contact>
	form: Resolved<ContactForm>
}

export type LegalPage = Resolved<Privacy> | Resolved<Term>

export type ErrorsData = Resolved<ErrorPage>
