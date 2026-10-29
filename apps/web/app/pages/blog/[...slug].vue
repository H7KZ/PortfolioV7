<script setup lang="ts">
import type { PostData } from '#shared/types/content'

const route = useRoute()
const slug = computed(() => ([] as string[]).concat(route.params.slug ?? []).join('/'))
const data = await useContent<PostData>(`posts/${slug.value}`)
const { data: layout } = useLayoutContent()
const absoluteUrl = useAbsoluteUrl()
const locale = useLocaleCode()

const post = computed(() => data.value.post)
const page = computed(() => data.value.page)
const site = computed(() => layout.value?.site)

const postUrl = computed(() => absoluteUrl(`/blog/${post.value.slug}`))
const tags = computed(() => (post.value.tags ?? []).filter(tag => tag !== 'EN'))
const description = computed(() => post.value.meta?.description ?? post.value.description ?? tags.value.join(', '))
const publishedIso = computed(() => new Date(post.value.date).toISOString())
const shareUrl = computed(() => {
	const text = `${post.value.title}${site.value?.twitterHandle ? ` by ${site.value.twitterHandle}` : ''}`
	return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl.value)}`
})

useSeo(() => ({
	title: post.value.meta?.title ?? post.value.title,
	description: description.value,
	image: post.value.meta?.image ?? post.value.thumbnail,
	type: 'article',
	extra: [
		{
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			headline: post.value.title,
			description: description.value,
			url: postUrl.value,
			datePublished: publishedIso.value,
			dateModified: new Date(post.value.updatedAt).toISOString(),
			author: { '@type': 'Person', name: post.value.author ?? site.value?.name, url: site.value?.siteUrl },
			publisher: { '@type': 'Person', name: site.value?.name, url: site.value?.siteUrl },
			image: mediaUrl(post.value.thumbnail) ? absoluteUrl(mediaUrl(post.value.thumbnail)!) : undefined,
			keywords: tags.value.join(', '),
			...(post.value.readingTime ? { timeRequired: `PT${post.value.readingTime}M` } : {})
		}
	]
}))
useHead(() => ({
	meta: [
		{ key: 'author', name: 'author', content: post.value.author ?? site.value?.name },
		{ key: 'article:published_time', property: 'article:published_time', content: publishedIso.value },
		{ key: 'article:author', property: 'article:author', content: site.value?.linkedinUrl },
		...tags.value.map(tag => ({ key: `article:tag:${tag}`, property: 'article:tag', content: tag }))
	],
	link: [{ key: 'rss', rel: 'alternate', type: 'application/rss+xml', title: page.value.feedTitle, href: '/feed.xml' }]
}))
</script>

<template>
	<article class="site-container flex flex-col gap-(--block-gap) pt-10 pb-(--section-gap) md:pt-14 lg:pt-20">
		<header class="flex max-w-[840px] flex-col gap-6">
			<p class="flex flex-wrap gap-x-3 type-mono-label text-mute">
				<time :datetime="publishedIso">{{ formatDate(post.date, locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) }}</time>
				<template v-if="post.readingTime">
					<span aria-hidden="true">·</span>
					<span>{{ post.readingTime }} {{ page.minutesLong }}</span>
				</template>
			</p>
			<h1 class="type-display-l">{{ post.title }}</h1>
			<p v-if="post.description" class="max-w-[60ch] type-body-l text-ink-soft">{{ post.description }}</p>
			<UiTags :tags="tags" />
		</header>

		<div class="section-grid">
			<div class="max-lg:hidden"></div>
			<div class="flex min-w-0 flex-col gap-(--block-gap)">
				<!-- eslint-disable-next-line vue/no-v-html -->
				<div class="prose-site prose" v-html="demoteHeadings(post.contentHtml)"></div>

				<aside class="flex flex-col gap-3 rounded-lg border border-line bg-surface p-6">
					<h2 class="type-h4">{{ page.shareLabel }}</h2>
					<p class="type-body-s text-ink-soft">{{ page.shareText }}</p>
					<p class="flex flex-wrap gap-x-6 type-button">
						<a
							:href="shareUrl"
							target="_blank"
							rel="noopener"
							class="inline-flex min-h-11 items-center text-ink underline decoration-control underline-offset-4 hover:decoration-ink"
							>{{ page.shareOnXLabel }}<span v-if="site?.newTabLabel" class="sr-only"> {{ site.newTabLabel }}</span></a
						>
						<a
							href="/feed.xml"
							class="inline-flex min-h-11 items-center text-ink underline decoration-control underline-offset-4 hover:decoration-ink"
							>{{ page.rssLabel }}</a
						>
					</p>
				</aside>
			</div>
		</div>
	</article>
</template>
