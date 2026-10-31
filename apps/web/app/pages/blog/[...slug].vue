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

const href = useHref()
const body = computed(() => {
	const html = demoteHeadings(post.value.contentHtml)
	const lead = /^[\s\S]*?<\/p>/.exec(html)?.[0] ?? html
	return { lead, rest: html.slice(lead.length) }
})
const postUrl = computed(() => absoluteUrl(`/blog/${post.value.slug}`))
const tags = computed(() => (post.value.tags ?? []).filter(tag => tag !== 'EN'))
const description = computed(() => post.value.meta?.description ?? post.value.description ?? tags.value.join(', '))
const publishedIso = computed(() => new Date(post.value.date).toISOString())
const shareTitle = computed(() => page.value.shareLabel.replace(/^◆\s*/, ''))
const backLabel = computed(() => splitGlyphs(page.value.backLabel).text)
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
	<article class="site-container pt-9 pb-[72px] md:pt-14 md:pb-24 lg:pt-16 lg:pb-36">
		<div class="lg:flex lg:items-start lg:gap-[120px]">
			<div class="flex max-w-[800px] min-w-0 flex-col gap-[18px] lg:flex-1 lg:gap-[22px]">
				<NuxtLink
					:to="href('/blog')"
					class="-my-3 inline-flex min-h-11 items-center gap-[0.6em] self-start type-mono-s text-ink-soft no-underline transition-colors duration-150 ease-(--ease) hover:text-ink"
					><ArrowGlyph class="-scale-x-100 text-accent" />{{ backLabel }}</NuxtLink
				>
				<div class="flex flex-wrap items-center gap-x-2 gap-y-2.5 [&_ul]:contents">
					<p class="type-mono-s text-mute">
						<time :datetime="publishedIso">{{
							formatDate(post.date, dateLocale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
						}}</time
						><template v-if="post.readingTime"> · {{ post.readingTime }} {{ page.minutesLong }}</template>
					</p>
					<UiTags :tags="tags" />
				</div>
				<h1 class="type-display-l">{{ post.title }}</h1>

				<!-- eslint-disable-next-line vue/no-v-html -->
				<div class="post-body" v-html="body.lead"></div>
				<TocBox v-if="page.tocLabel" class="lg:hidden" variant="inline" :label="page.tocLabel" :items="data.toc" />
				<!-- eslint-disable-next-line vue/no-v-html -->
				<div v-if="body.rest" class="post-body" v-html="body.rest"></div>

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
			<div v-if="page.tocLabel && data.toc.length" class="sticky top-24 hidden shrink-0 lg:block">
				<TocBox :label="page.tocLabel" :items="data.toc" />
			</div>
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

.post-body :deep(h2) {
	scroll-margin-top: 96px;
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

.post-body :deep(.code-block) {
	max-width: none;
	overflow: hidden;
	border: 1px solid var(--color-line);
	border-radius: var(--radius-md);
	background: var(--color-surface);
	font-family: var(--font-mono);
	font-size: 13px;
	line-height: 20px;
}

.post-body :deep(.code-bar) {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 14px;
	border-bottom: 1px solid var(--color-line);
}

.post-body :deep(.code-dots) {
	display: flex;
	gap: 8px;
}

.post-body :deep(.code-dots i) {
	width: 9px;
	height: 9px;
	border-radius: 50%;
	background: var(--color-line-strong);
}

.post-body :deep(.code-file) {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: var(--color-mute);
}

.post-body :deep(.code-copy) {
	position: relative;
	flex-shrink: 0;
	padding: 0;
	border: 0;
	background: none;
	font: inherit;
	color: var(--color-faint);
	cursor: pointer;
	transition: color 150ms var(--ease);
}

/* The bar is 41 px tall in the design; the hit area grows past it to reach 44 px. */
.post-body :deep(.code-copy::after) {
	content: '';
	position: absolute;
	inset: -12px -8px;
}

.post-body :deep(.code-copy:hover) {
	color: var(--color-ink);
}

.post-body :deep(.code-copy:focus-visible) {
	outline: 2px solid var(--color-focus);
	outline-offset: 4px;
	border-radius: 4px;
}

.post-body :deep(pre) {
	margin: 0;
	overflow-x: auto;
	padding: 16px 18px 18px;
	background: none;
	font-family: var(--font-mono);
	font-size: 13px;
	line-height: 20px;
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
