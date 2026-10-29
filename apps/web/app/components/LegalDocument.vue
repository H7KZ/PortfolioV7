<script setup lang="ts">
import type { LegalPage } from '#shared/types/content'

const { page } = defineProps<{ page: LegalPage }>()

const locale = useLocaleCode()
</script>

<template>
	<article class="site-container flex flex-col gap-(--block-gap) pt-10 pb-(--section-gap) md:pt-14 lg:pt-20">
		<header class="flex max-w-[840px] flex-col gap-6">
			<p class="type-mono-s text-mute"><span class="text-accent" aria-hidden="true">$ </span>{{ page.label }}</p>
			<h1 class="type-display-l">{{ page.title }}</h1>
			<p class="type-mono-label text-mute">
				{{ page.updatedLabel }}:
				<time :datetime="page.updatedAt">{{
					formatDate(page.updatedAt, locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
				}}</time>
			</p>
			<p v-if="page.bindingNote" class="max-w-[68ch] type-body-s text-ink-soft">{{ page.bindingNote }}</p>
		</header>

		<div class="section-grid">
			<div class="max-lg:hidden"></div>
			<div class="flex min-w-0 flex-col gap-(--block-gap)">
				<!-- eslint-disable-next-line vue/no-v-html -->
				<div class="prose-site prose" v-html="page.contentHtml"></div>
				<slot />
			</div>
		</div>
	</article>
</template>
