<script setup lang="ts">
const { data: layout } = useLayoutContent()
const href = useHref()
const { trackLink } = useAnalytics()

const footer = computed(() => layout.value?.footer)
const headingLines = computed(() => (footer.value?.headingBefore ?? '').split('\n'))
</script>

<template>
	<div v-if="footer" class="mt-30 pb-12">
		<div
			class="grid grid-cols-[1fr_auto] items-center gap-10 rounded-lg border border-(--line) bg-[linear-gradient(135deg,var(--bg-2),var(--bg))] p-12 px-10 max-md:grid-cols-1 max-md:p-8 max-md:px-6"
		>
			<div>
				<div class="mb-3 text-[11px] font-(--font-mono) tracking-widest text-(--fg-4) uppercase">◆ {{ footer.label }}</div>
				<h2 class="serif m-0 mb-6 text-[clamp(26px,4vw,40px)] leading-[1.15] font-light tracking-[-0.02em] text-(--fg)">
					<template v-for="(line, index) in headingLines" :key="index"><br v-if="index > 0" />{{ line }}</template
					>{{ ' '
					}}<NuxtLink
						:to="href(footer.ctaHref)"
						class="relative top-[-0.1em] mx-1 inline-flex items-center rounded-full bg-(--fg) px-3.5 py-1.5 align-middle text-[0.5em] font-(--font-sans) tracking-normal text-(--bg)"
						>{{ footer.ctaLabel }}</NuxtLink
					>{{ footer.headingAfter ? ` ${footer.headingAfter}` : '' }}
				</h2>
				<div class="flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-(--font-mono)">
					<a
						v-for="link in footer.links ?? []"
						:key="link.id ?? link.href"
						:href="href(link.href)"
						:target="link.external ? '_blank' : undefined"
						:rel="link.external ? 'noopener noreferrer' : undefined"
						class="text-(--fg-3) no-underline transition-colors duration-200 hover:text-(--accent)"
						@click="trackLink(link.href)"
						>{{ link.label }}<template v-if="link.arrow"> ↗</template></a
					>
				</div>
			</div>
			<JanKominekName class="h-auto w-45 shrink-0 -rotate-3 text-(--fg-4) opacity-70 max-md:hidden" aria-hidden="true" />
		</div>
	</div>
</template>
