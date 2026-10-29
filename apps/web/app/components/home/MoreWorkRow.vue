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
const needsArrow = computed(() => !external && !splitGlyphs(linkLabel).after)
const target = computed(() => (href ? (external ? href : localize(href)) : null))
</script>

<template>
	<li
		class="relative grid gap-1.5 border-b border-line py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-x-8 md:py-6 lg:grid-cols-[240px_minmax(0,1fr)_auto]"
		:class="
			target
				? 'group transition-colors duration-150 ease-(--ease) has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-focus'
				: ''
		"
	>
		<p class="type-mono-label text-mute md:col-start-1 md:row-start-1 lg:self-center">{{ meta }}</p>
		<div class="flex flex-col gap-1.5 md:col-start-1 md:row-start-2 lg:col-start-2 lg:row-start-1 lg:gap-1">
			<h3
				class="font-sans text-[20px] leading-[1.25] font-medium tracking-[-0.3px] text-wrap text-ink md:text-[18px] md:leading-[1.32] md:tracking-[-0.2px]"
			>
				{{ title }}
			</h3>
			<p v-if="description" class="type-body-s text-wrap text-ink-soft">{{ description }}</p>
		</div>
		<NuxtLink
			v-if="target"
			:to="target"
			:external="external || undefined"
			:target="external ? '_blank' : undefined"
			:rel="external ? 'noopener' : undefined"
			class="type-mono-s whitespace-nowrap text-accent no-underline group-hover:underline group-hover:underline-offset-4 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none md:col-start-2 md:row-span-2 md:row-start-1 lg:col-start-3 lg:row-span-1"
			@click="trackLink(href ?? '')"
		>
			<span class="sr-only">{{ title }}: </span><GlyphLabel :text="linkLabel" :new-tab="external ?? false" /><span
				v-if="needsArrow"
				aria-hidden="true"
				class="ml-[0.4em]"
				>→</span
			>
		</NuxtLink>
		<p
			v-else-if="linkLabel"
			class="type-mono-s whitespace-nowrap text-mute md:col-start-2 md:row-span-2 md:row-start-1 md:text-right lg:col-start-3 lg:row-span-1"
		>
			{{ linkLabel }}
		</p>
	</li>
</template>
