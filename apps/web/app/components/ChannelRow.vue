<script setup lang="ts">
const {
	icon,
	label,
	sub,
	href,
	to,
	external = false
} = defineProps<{
	icon?: string
	label: string | null | undefined
	sub?: string | null
	href?: string
	to?: string
	external?: boolean
}>()
const emit = defineEmits<{ select: [] }>()
const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
	<component
		:is="to ? NuxtLink : 'a'"
		:to="to"
		:href="to ? undefined : href"
		:target="external ? '_blank' : undefined"
		:rel="external ? 'noopener' : undefined"
		class="group flex items-center gap-3.5 rounded-md border border-line bg-surface py-3.5 pr-[18px] pl-3.5 no-underline transition-colors duration-150 ease-(--ease) hover:border-line-strong lg:gap-4 lg:py-4 lg:pr-5 lg:pl-4"
		@click="emit('select')"
	>
		<span class="grid h-11 w-11 shrink-0 place-items-center rounded-sm border border-line-strong bg-bg type-mono-s text-accent" aria-hidden="true"
			><slot name="icon">{{ icon }}</slot></span
		>
		<span class="flex min-w-0 flex-1 flex-col gap-0.5">
			<span class="type-body-medium text-ink"><GlyphLabel :text="label" :new-tab="external" /></span>
			<span v-if="sub" class="type-mono-s break-words text-mute">{{ sub }}</span>
		</span>
		<span class="type-mono-m text-accent transition-transform duration-150 ease-(--ease) group-hover:translate-x-0.5" aria-hidden="true"
			><ArrowGlyph
		/></span>
	</component>
</template>
