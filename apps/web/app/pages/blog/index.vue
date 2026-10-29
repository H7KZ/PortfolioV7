<script setup lang="ts">
import TablerArrowRight from '~icons/tabler/arrow-right'

import type { BlogData } from '#shared/types/content'

const data = await useContent<BlogData>('blog')
const href = useHref()
const locale = useLocaleCode()

const page = computed(() => data.value.page)

useSeo(() => ({
	title: page.value.meta?.title ?? page.value.heading.replace(/\.$/, ''),
	description: page.value.meta?.description ?? page.value.lead,
	image: page.value.meta?.image,
	type: 'website'
}))
useHead(() => ({
	link: [{ key: 'rss', rel: 'alternate', type: 'application/rss+xml', title: page.value.feedTitle, href: '/feed.xml' }]
}))
</script>

<template>
	<div class="site-container flex flex-col gap-(--block-gap) pt-10 pb-(--section-gap) md:pt-14 lg:pt-20">
		<header class="flex max-w-[840px] flex-col gap-6">
			<p class="type-mono-s text-mute"><span class="text-accent" aria-hidden="true">$ </span>{{ page.label }}</p>
			<h1 class="type-display-l">{{ page.heading }}</h1>
			<p v-if="page.lead" class="max-w-[60ch] type-body-l text-ink-soft">{{ page.lead }}</p>
		</header>

		<ul class="grid list-none gap-4 p-0 lg:gap-6">
			<li v-for="post in data.posts" :key="post.slug">
				<article
					class="group relative flex flex-col gap-4 rounded-lg border border-line bg-surface p-6 transition-colors duration-150 ease-(--ease) hover:border-line-strong has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-focus md:p-8"
				>
					<p class="flex flex-wrap gap-x-3 type-mono-label text-mute">
						<time :datetime="post.date">{{
							formatDate(post.date, locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
						}}</time>
						<template v-if="post.readingTime">
							<span aria-hidden="true">·</span>
							<span>{{ post.readingTime }} {{ page.minutesLong }}</span>
						</template>
					</p>
					<h2 class="max-w-[40ch] type-h3">
						<NuxtLink
							:to="href(`/blog/${post.slug}`)"
							class="text-ink no-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
							>{{ post.title }}</NuxtLink
						>
					</h2>
					<p v-if="post.description" class="max-w-[68ch] type-body text-ink-soft">{{ post.description }}</p>
					<UiTags :tags="(post.tags ?? []).filter(tag => tag !== 'EN')" />
					<p v-if="page.readLabel" class="flex items-center gap-2 type-button text-ink" aria-hidden="true">
						{{ page.readLabel }}
						<TablerArrowRight class="h-4 w-4 transition-transform duration-200 ease-(--ease) group-hover:translate-x-1" />
					</p>
				</article>
			</li>
		</ul>

		<aside v-if="page.draftingLabel || page.nextUpText" class="flex flex-col gap-2 border-t border-line pt-8">
			<p class="flex items-center gap-2 type-mono-label text-mute"><span class="live-dot" aria-hidden="true"></span>{{ page.draftingLabel }}</p>
			<p class="type-body text-ink-soft">{{ page.nextUpText }}</p>
		</aside>
	</div>
</template>
