<script setup lang="ts">
const {
	label,
	value,
	sub,
	variant = 'number',
	layout = 'case'
} = defineProps<{
	label: string
	value: string
	sub?: string | null
	variant?: 'number' | 'text' | 'accent' | null
	/** Résumé tiles stay stacked at every width; case study tiles turn into a label-left, value-right row on mobile. */
	layout?: 'resume' | 'case'
}>()

const valueClass = computed(() => {
	const tone = variant === 'accent' ? 'text-accent' : 'text-ink'
	if (layout === 'resume') return variant === 'number' || !variant ? `type-h3 lg:type-stat ${tone}` : `type-h3 ${tone}`
	const base = variant === 'text' || variant === 'accent' ? 'md:type-h3' : 'md:type-h3 lg:type-stat'
	return `${base} text-[20px] leading-[22px] font-bold tracking-[-0.7px] ${tone} max-md:col-start-2 max-md:row-span-2 max-md:row-start-1 max-md:self-center max-md:text-right`
})
</script>

<template>
	<div
		class="rounded-md border border-line bg-surface"
		:class="
			layout === 'resume'
				? 'flex flex-col gap-2 px-5 pt-5 pb-[19px] md:pb-[18px] lg:min-h-[158px] lg:gap-2.5 lg:p-6'
				: 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-[18px] py-4 md:flex md:flex-col md:items-stretch md:gap-2 md:px-5 md:pt-5 md:pb-[18px] lg:gap-2.5 lg:p-6'
		"
	>
		<dt class="flex items-center gap-2 type-mono-label text-mute" :class="layout === 'case' && 'max-md:col-start-1 max-md:row-start-1'">
			<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-line-strong" aria-hidden="true"></span>{{ label }}
		</dt>
		<dd class="m-0" :class="valueClass">{{ value }}</dd>
		<dd v-if="sub" class="m-0 type-body-s text-mute" :class="layout === 'case' && 'max-md:col-start-1 max-md:row-start-2'">{{ sub }}</dd>
	</div>
</template>
