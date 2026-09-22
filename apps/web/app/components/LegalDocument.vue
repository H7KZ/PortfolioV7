<script setup lang="ts">
import type { LegalPage } from '#shared/types/content'

const { page } = defineProps<{ page: LegalPage }>()

const locale = useLocaleCode()
</script>

<template>
	<div class="mx-auto max-w-(--max) px-8 max-sm:px-5">
		<div class="mx-auto max-w-200 pt-10">
			<header class="mb-10 border-b border-(--line) pb-8">
				<div class="mono mb-3.5 text-[11px] tracking-widest text-(--fg-4) uppercase">{{ page.label }}</div>
				<h1 class="serif m-0 mb-4 text-[clamp(32px,5vw,56px)] leading-none tracking-[-0.025em]">
					{{ page.title }}<span class="text-(--fg-3)">.</span>
				</h1>
				<p class="mono m-0 text-[12px] tracking-[0.04em] text-(--fg-4)">
					{{ page.updatedLabel }}: {{ formatDate(page.updatedAt, locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) }}
				</p>
				<p v-if="page.bindingNote" class="mt-3 mb-0 text-[13px] leading-[1.55] text-(--fg-3)">{{ page.bindingNote }}</p>
			</header>

			<!-- eslint-disable-next-line vue/no-v-html -->
			<article class="legal-prose prose w-full text-[15px] leading-[1.7] text-(--fg-2) prose-neutral prose-invert" v-html="page.contentHtml"></article>

			<slot />

			<ContactFooter />
		</div>
	</div>
</template>

<style scoped>
.legal-prose :deep(h2) {
	color: var(--fg);
	font-family: var(--font-serif), serif;
	font-weight: 300;
	letter-spacing: -0.02em;
}

.legal-prose :deep(p),
.legal-prose :deep(li) {
	color: var(--fg-2);
}

.legal-prose :deep(strong) {
	color: var(--fg);
	font-weight: 500;
}

.legal-prose :deep(a) {
	color: var(--accent);
	text-decoration-color: var(--accent-ring);
}
</style>
