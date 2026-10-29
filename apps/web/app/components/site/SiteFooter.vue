<script setup lang="ts">
const { data: layout } = useLayoutContent()
const href = useHref()
const { trackLink } = useAnalytics()

const footer = computed(() => layout.value?.footer)
</script>

<template>
	<footer v-if="footer" class="border-t border-line">
		<div class="site-container flex flex-col items-start gap-1 pt-4 pb-6 md:flex-row md:items-center md:justify-between md:pb-7">
			<p class="type-mono-s text-faint">{{ footer.copyright }}</p>
			<ul class="flex list-none flex-wrap gap-x-[18px] p-0 md:gap-x-6">
				<li v-for="link in footer.links ?? []" :key="link.id ?? link.href">
					<NuxtLink
						:to="href(link.href)"
						:external="link.external || link.href.startsWith('/feed.xml') || undefined"
						:target="link.external ? '_blank' : undefined"
						:rel="link.external ? 'noopener' : undefined"
						class="inline-flex min-h-11 items-center gap-[0.6em] type-mono-s text-mute no-underline transition-colors duration-150 ease-(--ease) hover:text-ink"
						@click="trackLink(link.href)"
					>
						{{ link.label }}<span v-if="link.arrow" aria-hidden="true">↗</span>
						<span v-if="link.external && layout?.site.newTabLabel" class="sr-only">{{ layout.site.newTabLabel }}</span>
					</NuxtLink>
				</li>
			</ul>
		</div>
	</footer>
</template>
