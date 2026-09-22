<script setup lang="ts">
import type { BlogData } from '#shared/types/content'

const data = await useContent<BlogData>('blog')
const href = useHref()
const locale = useLocaleCode()

const page = computed(() => data.value.page)

useSeo(() => ({
	title: page.value.meta?.title ?? page.value.heading,
	description: page.value.meta?.description,
	image: page.value.meta?.image,
	type: 'website'
}))
useHead(() => ({
	link: [{ key: 'rss', rel: 'alternate', type: 'application/rss+xml', title: page.value.feedTitle, href: '/feed.xml' }]
}))
</script>

<template>
	<div class="mx-auto max-w-(--max) px-8 max-sm:px-5">
		<div class="flex items-end justify-between gap-6 border-b border-(--line) pt-10 pb-5">
			<div>
				<div class="mono mb-1.5 text-[11px] tracking-widest text-(--fg-4) uppercase">{{ page.label }}</div>
				<h1 class="serif m-0 text-[clamp(28px,3.5vw,44px)] font-light tracking-[-0.02em]">{{ page.heading }}</h1>
			</div>
		</div>

		<div class="mb-20 flex flex-col">
			<NuxtLink
				v-for="post in data.posts"
				:key="post.slug"
				:to="href(`/blog/${post.slug}`)"
				class="grid grid-cols-[120px_1fr_auto_auto] items-center gap-7 border-t border-(--line) py-6 text-(--fg) no-underline transition-[padding-left] duration-200 last:border-b last:border-(--line) hover:pl-2.5 max-md:grid-cols-1 max-md:gap-1.5 max-md:py-4.5"
			>
				<div class="mono text-[12px] tracking-[0.04em] text-(--fg-4)">{{ formatDate(post.date, locale) }}</div>
				<div>
					<h2 class="serif m-0 text-[20px] leading-[1.3] font-light tracking-[-0.01em]">{{ post.title }}</h2>
					<p v-if="post.description" class="m-0 mt-1 text-[13px] leading-[1.5] text-(--fg-4) max-md:hidden">{{ post.description }}</p>
				</div>
				<div class="mono flex gap-1 text-[11px] whitespace-nowrap text-(--fg-4)">
					<template v-for="tag in post.tags ?? []" :key="tag">
						<span>{{ tag }}</span>
						<span class="text-(--fg-5)">/</span>
					</template>
				</div>
				<div class="mono text-[11px] tracking-[0.04em] whitespace-nowrap text-(--fg-4)">
					{{ post.readingTime ? `${post.readingTime} ${page.minutesShort}` : '' }}
				</div>
			</NuxtLink>
		</div>

		<div class="pb-20">
			<ContactFooter />
		</div>
	</div>
</template>
