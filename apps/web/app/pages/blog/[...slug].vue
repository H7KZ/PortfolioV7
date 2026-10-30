<script setup lang="ts">
import type { PostData } from '#shared/types/content'

const route = useRoute()
const slug = computed(() => ([] as string[]).concat(route.params.slug ?? []).join('/'))
const data = await useContent<PostData>(`posts/${slug.value}`)
const { data: layout } = useLayoutContent()
const absoluteUrl = useAbsoluteUrl()
const locale = useLocaleCode()
const dateLocale = computed(() => (locale.value === 'en' ? 'en-GB' : locale.value))

const post = computed(() => data.value.post)
const page = computed(() => data.value.page)
const site = computed(() => layout.value?.site)

const postUrl = computed(() => absoluteUrl(`/blog/${post.value.slug}`))
const tags = computed(() => (post.value.tags ?? []).filter(tag => tag !== 'EN'))
const description = computed(() => post.value.meta?.description ?? post.value.description ?? tags.value.join(', '))
const publishedIso = computed(() => new Date(post.value.date).toISOString())
const shareTitle = computed(() => page.value.shareLabel.replace(/^◆\s*/, ''))
const shareOnX = computed(() => splitGlyphs(page.value.shareOnXLabel).text)
const rss = computed(() => splitGlyphs(page.value.rssLabel).text)
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
	<article class="site-container pt-[74px] pb-[72px] md:pt-24 md:pb-24 lg:pt-[106px] lg:pb-36">
		<div class="flex max-w-[800px] min-w-0 flex-col gap-[18px] lg:gap-[22px]">
			<div class="flex flex-wrap items-center gap-x-2 gap-y-2.5">
				<p class="type-mono-s text-mute">
					<time :datetime="publishedIso">{{
						formatDate(post.date, dateLocale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
					}}</time
					><template v-if="post.readingTime"> · {{ post.readingTime }} {{ page.minutesLong }}</template>
				</p>
				<UiTags :tags="tags" />
			</div>
			<h1 class="type-display-l [text-wrap:wrap] md:text-[52px] md:leading-none md:tracking-[-1.9px]">{{ post.title }}</h1>

			<!-- eslint-disable-next-line vue/no-v-html -->
			<div class="post-body" v-html="demoteHeadings(post.contentHtml)"></div>

			<aside class="flex flex-col gap-4 rounded-md border border-line bg-surface p-[21px] sm:flex-row sm:items-center sm:p-6">
				<div class="flex min-w-0 flex-1 flex-col gap-1">
					<h2 class="type-h4 text-ink">{{ shareTitle }}</h2>
					<p class="type-body-s text-mute">{{ page.shareText }}</p>
				</div>
				<div class="flex flex-wrap gap-2.5 sm:flex-nowrap">
					<UiButton kind="secondary" :href="shareUrl" external>
						{{ shareOnX }}<span v-if="site?.newTabLabel" class="sr-only"> {{ site.newTabLabel }}</span>
					</UiButton>
					<UiButton kind="secondary" href="/feed.xml">{{ rss }}</UiButton>
				</div>
			</aside>
		</div>
	</article>
</template>

<style scoped>
.post-body {
	display: flex;
	flex-direction: column;
	gap: inherit;
	font-family: var(--font-sans);
	font-size: 17px;
	line-height: 1.56;
	color: var(--color-ink-soft);
}

.post-body :deep(> *) {
	margin: 0;
	max-width: 680px;
}

.post-body :deep(> p:first-child) {
	font-size: 17px;
	line-height: 1.52;
}

.post-body :deep(hr) {
	height: 12px;
	border: 0;
	background: none;
}

.post-body :deep(h2),
.post-body :deep(h3) {
	text-wrap: wrap;
}

.post-body :deep(h2) {
	font-size: 20px;
	font-weight: 500;
	line-height: 1.25;
	letter-spacing: -0.3px;
	color: var(--color-ink);
}

.post-body :deep(h3) {
	font-size: 18px;
	font-weight: 500;
	line-height: 1.32;
	letter-spacing: -0.2px;
	color: var(--color-ink);
}

.post-body :deep(strong) {
	font-weight: 500;
	font-size: 18px;
	color: var(--color-ink);
}

.post-body :deep(a) {
	color: var(--color-ink);
	text-decoration: underline;
	text-decoration-color: var(--color-control);
	text-underline-offset: 4px;
}

.post-body :deep(a:hover) {
	text-decoration-color: var(--color-ink);
}

.post-body :deep(code) {
	font-family: var(--font-mono);
	font-size: 15px;
	color: var(--color-accent);
	overflow-wrap: anywhere;
}

.post-body :deep(ul) {
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 0;
	list-style: none;
}

.post-body :deep(li) {
	position: relative;
	padding-left: 21px;
}

.post-body :deep(li::before) {
	content: '›';
	position: absolute;
	left: 0;
	font-family: var(--font-mono);
	font-size: 15px;
	font-weight: 500;
	line-height: 1.4;
	color: var(--color-accent);
}

.post-body :deep(pre) {
	max-width: none;
	overflow-x: auto;
	padding: 16px 18px 18px;
	border: 1px solid var(--color-line);
	border-radius: var(--radius-md);
	background: var(--color-surface) !important;
	font-family: var(--font-mono);
	font-size: 13px;
	line-height: 1.5;
	tab-size: 4;
}

.post-body :deep(pre code) {
	font-size: inherit;
	color: inherit;
	overflow-wrap: normal;
}

.post-body :deep(blockquote) {
	max-width: none;
	padding: 18px 20px;
	border: 1px solid var(--color-accent);
	border-radius: var(--radius-md);
	background: var(--color-accent-soft);
	color: var(--color-ink);
	font-size: 16px;
	line-height: 1.6;
}

.post-body :deep(blockquote p) {
	margin: 0;
}

.post-body :deep(div:has(> img)) {
	max-width: none;
}

.post-body :deep(img) {
	display: block;
	width: 100%;
	max-height: 560px;
	object-fit: contain;
	border-radius: var(--radius-md);
}

@media (min-width: 768px) {
	.post-body :deep(> p:first-child) {
		font-size: 18px;
	}
}

@media (min-width: 768px) {
	.post-body :deep(hr) {
		height: 20px;
	}

	.post-body :deep(h2) {
		font-size: 22px;
		line-height: 1.22;
		letter-spacing: -0.4px;
	}
}
</style>
