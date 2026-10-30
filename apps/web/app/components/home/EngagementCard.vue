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
			class="font-sans text-[20px] leading-[25px] font-medium tracking-[-0.3px] text-ink md:text-[18px] md:leading-6 md:tracking-[-0.2px] lg:text-[22px] lg:leading-[27px] lg:tracking-[-0.4px]"
		>
			{{ title }}
		</h3>
		<p class="type-body text-ink-soft">{{ description }}</p>
		<UiTags :tags="tags" />
	</article>
</template>
