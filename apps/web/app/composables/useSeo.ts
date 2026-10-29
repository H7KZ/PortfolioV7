import type { MediaView, Relation } from '#shared/types/content'

interface SeoInput {
	title: string
	description?: string | null
	image?: Relation | string
	imageAlt?: string | null
	type?: 'website' | 'article' | 'profile'
	extra?: Record<string, unknown>[]
}

export function useAbsoluteUrl(): (path: string) => string {
	const siteUrl = useRuntimeConfig().public.siteUrl
	return path => `${siteUrl}${path}`
}

export function mediaUrl(value: Relation | string | undefined): string | null {
	if (!value) return null
	if (typeof value === 'string') return value
	return typeof value === 'object' ? (value as MediaView).url : null
}

export function useSeo(input: () => SeoInput) {
	const route = useRoute()
	const absoluteUrl = useAbsoluteUrl()
	const { data: layout } = useLayoutContent()
	useHead(() => {
		const seo = input()
		const name = layout.value?.site.name
		// Titles read "<Page> · Jan Komínek"; CMS SEO titles that already carry the name stay as written.
		const title = !name || !seo.title || seo.title.includes(name) ? seo.title : `${seo.title} · ${name}`
		const url = absoluteUrl(route.path)
		const image = mediaUrl(seo.image)
		const imageUrl = image ? (image.startsWith('http') ? image : absoluteUrl(image)) : undefined
		return {
			title,
			meta: [
				{ key: 'description', name: 'description', content: seo.description ?? undefined },
				{ key: 'og:type', property: 'og:type', content: seo.type ?? 'website' },
				{ key: 'og:title', property: 'og:title', content: title },
				{ key: 'og:description', property: 'og:description', content: seo.description ?? undefined },
				{ key: 'og:url', property: 'og:url', content: url },
				...(imageUrl
					? [
							{ key: 'og:image', property: 'og:image', content: imageUrl },
							{ key: 'og:image:alt', property: 'og:image:alt', content: seo.imageAlt ?? seo.title },
							{ key: 'twitter:image', name: 'twitter:image', content: imageUrl }
						]
					: []),
				{ key: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
				{ key: 'twitter:title', name: 'twitter:title', content: title },
				{ key: 'twitter:description', name: 'twitter:description', content: seo.description ?? undefined }
			],
			link: [{ key: 'canonical', rel: 'canonical', href: url }],
			script: (seo.extra ?? []).map((data, index) => ({
				key: `ld-${index}`,
				type: 'application/ld+json',
				innerHTML: JSON.stringify(data)
			}))
		}
	})
}
