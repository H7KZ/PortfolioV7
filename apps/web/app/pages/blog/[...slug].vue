<script setup lang="ts">
import type { PostData } from '#shared/types/content'

const route = useRoute()
const slug = computed(() => ([] as string[]).concat(route.params.slug ?? []).join('/'))
const data = await useContent<PostData>(`posts/${slug.value}`)
const { data: layout } = useLayoutContent()
const absoluteUrl = useAbsoluteUrl()

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
	title: post.value.meta?.title ?? `${post.value.title} · ${site.value?.name ?? ''}`,
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
	<div class="flex w-full items-center justify-center px-8 max-sm:px-5">
		<div class="flex w-full max-w-360 flex-col gap-56 pt-16 pb-32">
			<article class="flex w-full flex-col items-center">
				<div class="mono mb-8 flex w-full max-w-270 flex-wrap items-center gap-4 text-[11px] tracking-[0.06em] text-(--fg-4)">
					<time :datetime="publishedIso">
						{{ formatDate(post.date, 'en-GB', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) }}
					</time>
					<template v-if="post.readingTime">
						<span class="text-(--fg-5)">·</span>
						<span>{{ post.readingTime }} {{ page.minutesLong }}</span>
					</template>
					<template v-for="tag in tags" :key="tag">
						<span class="text-(--fg-5)">·</span>
						<span>{{ tag }}</span>
					</template>
				</div>

				<!-- eslint-disable-next-line vue/no-v-html -->
				<div
					class="prose w-full max-w-270! prose-neutral prose-invert prose-h1:text-5xl prose-h1:font-semibold prose-h2:text-4xl prose-h2:font-normal prose-h3:text-3xl prose-h3:font-normal prose-h4:text-2xl prose-h4:font-normal prose-h5:text-xl prose-h5:font-normal prose-h6:text-lg prose-h6:font-normal prose-p:font-light prose-p:text-neutral-100 prose-code:bg-neutral-800! prose-pre:bg-neutral-800!"
					v-html="post.contentHtml"
				></div>
			</article>

			<div class="mx-auto w-full max-w-270">
				<div class="rounded-(--radius) border border-(--line) bg-(--bg-2) px-6 py-5">
					<div class="mono mb-1 text-[10px] tracking-widest text-(--fg-4) uppercase">{{ page.shareLabel }}</div>
					<p class="m-0 mb-3 text-[13px] leading-[1.55] text-(--fg-3)">{{ page.shareText }}</p>
					<div class="flex flex-wrap gap-3">
						<a
							:href="shareUrl"
							target="_blank"
							rel="noopener noreferrer"
							class="mono inline-flex items-center gap-1.5 text-[11px] tracking-[0.04em] text-(--fg-3) no-underline transition-colors duration-150 hover:text-(--fg)"
						>
							{{ page.shareOnXLabel }}
						</a>
						<span class="text-(--fg-5)">·</span>
						<a
							href="/feed.xml"
							class="mono inline-flex items-center gap-1.5 text-[11px] tracking-[0.04em] text-(--fg-3) no-underline transition-colors duration-150 hover:text-(--fg)"
						>
							{{ page.rssLabel }}
						</a>
					</div>
				</div>
			</div>

			<ContactFooter />
		</div>
	</div>
</template>
