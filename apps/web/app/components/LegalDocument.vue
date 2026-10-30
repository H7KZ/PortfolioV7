<script setup lang="ts">
import type { LegalPage } from '#shared/types/content'

const { page } = defineProps<{ page: LegalPage }>()

const locale = useLocaleCode()
const dateLocale = computed(() => (locale.value === 'en' ? 'en-GB' : locale.value))

const title = computed(() => (page.title.endsWith('.') ? { plain: page.title.slice(0, -1), accent: '.' } : { plain: page.title, accent: '' }))

/** A section made of nothing but a bullet list is the short summary; the design lifts it into a callout above the text. */
const SUMMARY = /<h2>([^<]*)<\/h2>\s*(<ul class="list-bullet">(?:(?!<h2)[\s\S])*?<\/ul>)\s*(?=<h2|$)/
const split = computed(() => {
	const html = demoteHeadings(page.contentHtml)
	const match = SUMMARY.exec(html)
	if (!match) return { summary: null, body: html }
	return { summary: { label: match[1], list: match[2] }, body: html.replace(match[0], '') }
})
</script>

<template>
	<article class="site-container pt-9 pb-[72px] md:pt-14 md:pb-24 lg:pt-16 lg:pb-36">
		<div class="flex max-w-[800px] min-w-0 flex-col gap-4 lg:gap-[22px]">
			<p class="type-mono-s text-mute"><span class="text-accent" aria-hidden="true">$ </span>{{ page.label }}</p>
			<h1 class="type-display-l">
				{{ title.plain }}<span class="text-accent">{{ title.accent }}</span>
			</h1>
			<div class="flex flex-col items-start gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-2 lg:gap-y-2">
				<span
					class="inline-flex items-center gap-[7px] rounded-full border border-line bg-surface-2 py-[5px] pr-2.5 pl-[9px] type-mono-label text-mute"
				>
					<span class="size-1.5 shrink-0 rounded-full bg-faint" aria-hidden="true"></span>
					<span
						>{{ page.updatedLabel }}
						<time :datetime="page.updatedAt">{{
							formatDate(page.updatedAt, dateLocale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
						}}</time></span
					>
				</span>
				<p v-if="page.bindingNote" class="type-mono-s text-mute">{{ page.bindingNote }}</p>
			</div>

			<section v-if="split.summary" class="flex flex-col gap-2.5 rounded-md border border-accent bg-accent-soft px-5 py-[18px] lg:px-6 lg:py-[22px]">
				<p class="type-mono-label text-accent">{{ split.summary.label }}</p>
				<!-- eslint-disable-next-line vue/no-v-html -->
				<div class="legal-body" v-html="split.summary.list"></div>
			</section>

			<!-- eslint-disable-next-line vue/no-v-html -->
			<div class="legal-body" v-html="split.body"></div>
			<slot />
		</div>
	</article>
</template>

<style scoped>
.legal-body {
	display: flex;
	flex-direction: column;
	gap: inherit;
	font-family: var(--font-sans);
	font-size: 16px;
	line-height: 1.6;
	color: var(--color-ink-soft);
}

.legal-body :deep(> *) {
	margin: 0;
	max-width: 680px;
}

.legal-body :deep(h2) {
	margin-top: 28px;
	font-size: 20px;
	font-weight: 500;
	line-height: 1.25;
	letter-spacing: -0.3px;
	color: var(--color-ink);
}

.legal-body :deep(strong) {
	font-weight: inherit;
}

.legal-body :deep(a) {
	color: var(--color-ink);
	text-decoration: underline;
	text-decoration-color: var(--color-control);
	text-underline-offset: 4px;
}

.legal-body :deep(a:hover) {
	text-decoration-color: var(--color-ink);
}

.legal-body :deep(a[href^='mailto:']) {
	font-family: var(--font-mono);
	font-size: 13px;
	color: var(--color-accent);
	text-decoration: none;
}

.legal-body :deep(ul) {
	display: flex;
	flex-direction: column;
	gap: 10px;
	max-width: none;
	padding: 0;
	list-style: none;
	font-size: 17px;
	line-height: 1.56;
}

.legal-body :deep(li) {
	position: relative;
	padding-left: 21px;
}

.legal-body :deep(li::before) {
	content: '›';
	position: absolute;
	left: 0;
	font-family: var(--font-mono);
	font-size: 15px;
	font-weight: 500;
	line-height: 1.4;
	color: var(--color-accent);
}

.legal-body :deep(code) {
	font-family: var(--font-mono);
	font-size: 13px;
	color: var(--color-accent);
}

@media (min-width: 768px) {
	.legal-body {
		font-size: 17px;
		line-height: 1.52;
	}

	.legal-body :deep(h2) {
		font-size: 22px;
		line-height: 1.22;
		letter-spacing: -0.4px;
	}
}

@media (min-width: 1024px) {
	.legal-body {
		font-size: 16px;
		line-height: 1.6;
	}

	.legal-body :deep(h2) {
		margin-top: 42px;
	}
}
</style>
