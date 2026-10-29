<script setup lang="ts">
const { label, title, description, tags } = defineProps<{
	label?: string | null
	title: string
	description: string
	tags?: string[] | null
}>()
</script>

<template>
	<article class="flex h-full flex-col items-start gap-3 rounded-md border border-line bg-surface p-[22px] md:p-[18px] lg:gap-3.5 lg:rounded-lg lg:p-7">
		<UiStatus v-if="label">{{ label }}</UiStatus>
		<h3
			class="font-sans text-[20px] leading-[1.25] font-medium tracking-[-0.3px] text-wrap text-ink md:text-[18px] md:leading-[1.32] md:tracking-[-0.2px] lg:text-[22px] lg:leading-[1.22] lg:tracking-[-0.4px]"
		>
			{{ title }}
		</h3>
		<p class="type-body text-wrap text-ink-soft">{{ description }}</p>
		<UiTags :tags="tags" />
	</article>
</template>
