<script setup lang="ts">
import TablerArrowRight from '~icons/tabler/arrow-right'
import TablerArrowUpRight from '~icons/tabler/arrow-up-right'

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
		class="group grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-lg border border-line bg-surface px-5 py-4 no-underline transition-colors duration-150 ease-(--ease) hover:border-line-strong"
		@click="emit('select')"
	>
		<span class="grid h-10 w-10 place-items-center rounded-md border border-line bg-surface-2 type-mono-s text-ink-soft" aria-hidden="true"
			><slot name="icon">{{ icon }}</slot></span
		>
		<span class="flex min-w-0 flex-col gap-0.5">
			<span class="type-body-medium text-ink"><GlyphLabel :text="label" :new-tab="external" /></span>
			<span v-if="sub" class="type-mono-s break-words text-mute">{{ sub }}</span>
		</span>
		<component
			:is="external ? TablerArrowUpRight : TablerArrowRight"
			class="h-4 w-4 text-mute transition-colors duration-150 ease-(--ease) group-hover:text-accent"
			aria-hidden="true"
		/>
	</component>
</template>
