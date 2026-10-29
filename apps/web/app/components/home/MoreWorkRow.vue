<script setup lang="ts">
const {
	meta,
	title,
	description,
	linkLabel,
	href,
	external = false
} = defineProps<{
	meta: string
	title: string
	description?: string | null
	linkLabel?: string | null
	href?: string | null
	external?: boolean | null
}>()

const localize = useHref()
const { trackLink } = useAnalytics()
const target = computed(() => (href ? (external ? href : localize(href)) : null))
</script>

<template>
	<li
		class="relative grid gap-2 border-t border-line py-6 last:border-b md:grid-cols-[200px_minmax(0,1fr)_auto] md:items-baseline md:gap-8 lg:grid-cols-[360px_minmax(0,1fr)_auto] lg:gap-0"
		:class="
			target
				? 'group transition-colors duration-150 ease-(--ease) has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-focus'
				: ''
		"
	>
		<p class="type-mono-label text-mute">{{ meta }}</p>
		<div class="flex flex-col gap-1 lg:pr-12">
			<h3 class="type-h4">{{ title }}</h3>
			<p v-if="description" class="type-body-s text-ink-soft">{{ description }}</p>
		</div>
		<NuxtLink
			v-if="target"
			:to="target"
			:external="external || undefined"
			:target="external ? '_blank' : undefined"
			:rel="external ? 'noopener' : undefined"
			class="inline-flex min-h-11 items-center type-button text-ink no-underline group-hover:underline group-hover:underline-offset-4 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
			@click="trackLink(href ?? '')"
		>
			<span class="sr-only">{{ title }}: </span><GlyphLabel :text="linkLabel" :new-tab="external ?? false" />
		</NuxtLink>
		<p v-else-if="linkLabel" class="type-mono-label text-mute md:text-right">{{ linkLabel }}</p>
	</li>
</template>
