<script setup lang="ts">
import TablerArrowRight from '~icons/tabler/arrow-right'

import type { BlogData } from '#shared/types/content'

const data = await useContent<BlogData>('blog')
const href = useHref()
const locale = useLocaleCode()
const dateLocale = computed(() => (locale.value === 'en' ? 'en-GB' : locale.value))

const page = computed(() => data.value.page)
const cards = computed(() => data.value.posts.map(post => ({ post, image: asMedia(post.thumbnail ?? null) })))
const heading = computed(() => {
	const text = page.value.heading
	return text.endsWith('.') ? { plain: text.slice(0, -1), accent: '.' } : { plain: text, accent: '' }
})

/** The EN marker follows the topic tags. */
function orderedTags(tags: string[] | null | undefined): string[] {
	return [...(tags ?? []).filter(tag => tag !== 'EN'), ...(tags ?? []).filter(tag => tag === 'EN')]
}

/** Posts written only in English carry an EN tag; on the Czech site they are marked so screen readers switch voice. */
function postLang(tags: string[] | null | undefined): string | undefined {
	return locale.value !== 'en' && tags?.includes('EN') ? 'en' : undefined
}

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
	<div class="site-container pb-[72px] md:pb-24 lg:pb-36">
		<header class="flex flex-col gap-4 pt-9 pb-7 md:pt-14 md:pb-9 lg:gap-5 lg:pt-[72px] lg:pb-12">
			<p class="type-mono-s text-mute"><span class="text-accent" aria-hidden="true">$ </span>{{ page.label }}</p>
			<h1 class="type-display-l whitespace-pre-line">
				{{ heading.plain }}<span class="text-accent">{{ heading.accent }}</span>
			</h1>
			<p v-if="page.lead" class="type-body-l text-ink-soft">{{ page.lead }}</p>
		</header>

		<ul class="flex list-none flex-col gap-5 p-0 lg:gap-0 lg:border-t lg:border-line">
			<li v-for="{ post, image } in cards" :key="post.slug">
				<article
					class="group relative flex flex-col gap-3.5 overflow-hidden rounded-lg border border-line bg-surface transition-colors duration-150 ease-(--ease) hover:border-line-strong has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-focus lg:flex-row lg:gap-10 lg:overflow-visible lg:rounded-none lg:border-0 lg:border-b lg:bg-transparent lg:py-10 lg:hover:border-line"
					:lang="postLang(post.tags)"
				>
					<div
						v-if="image"
						class="h-[200px] w-full shrink-0 overflow-hidden md:h-[320px] lg:order-3 lg:h-60 lg:w-[360px] lg:rounded-md lg:border lg:border-line"
					>
						<ResponsiveImage :image="image" alt="" sizes="(min-width: 1024px) 360px, 100vw" img-class="h-full w-full object-cover" />
					</div>
					<div class="hidden w-40 shrink-0 flex-col gap-1.5 type-mono-s lg:flex">
						<time :datetime="post.date" class="text-ink-soft">{{
							formatDate(post.date, dateLocale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
						}}</time>
						<span v-if="post.readingTime" class="text-faint">{{ post.readingTime }} {{ page.minutesLong }}</span>
					</div>
					<div class="flex min-w-0 flex-1 flex-col gap-3 px-5 pt-1 pb-[22px] md:px-7 md:pb-7 lg:gap-3.5 lg:p-0">
						<p class="type-mono-s text-mute lg:hidden">
							<time :datetime="post.date">{{
								formatDate(post.date, dateLocale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
							}}</time
							><template v-if="post.readingTime"> · {{ post.readingTime }} {{ page.minutesLong }}</template>
						</p>
						<h2 class="type-h2 text-ink">
							<NuxtLink
								:to="href(`/blog/${post.slug}`)"
								class="text-ink no-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
								>{{ post.title }}</NuxtLink
							>
						</h2>
						<p v-if="post.description" class="type-body text-ink-soft">{{ post.description }}</p>
						<UiTags :tags="orderedTags(post.tags)" />
						<p v-if="page.readLabel" class="flex gap-2 type-mono-s text-ink" aria-hidden="true">
							{{ page.readLabel }}<ArrowGlyph class="self-center text-accent" />
						</p>
					</div>
				</article>
			</li>
		</ul>

		<div
			v-if="page.draftingLabel || page.nextUpText"
			class="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-2 md:flex-nowrap md:gap-x-2.5 lg:mt-0 lg:gap-x-3 lg:pt-7"
		>
			<span
				class="inline-flex shrink-0 items-center gap-[7px] rounded-full border border-line bg-surface-2 py-[5px] pr-2.5 pl-[9px] type-mono-label text-mute lg:border-0 lg:text-accent"
			>
				<span class="size-1.5 shrink-0 rounded-full bg-faint lg:bg-accent" aria-hidden="true"></span>{{ page.draftingLabel }}
			</span>
			<p class="min-w-0 flex-1 type-mono-s break-words text-mute">{{ page.nextUpText }}</p>
		</div>
	</div>
</template>
