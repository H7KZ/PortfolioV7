<script setup lang="ts">
const { label, title, description, tags } = defineProps<{
	label?: string | null
	title: string
	description: string
	tags?: string[] | null
}>()
</script>

<template>
	<article class="flex h-full flex-col gap-4 rounded-lg border border-line bg-surface p-6">
		<UiStatus v-if="label">{{ label }}</UiStatus>
		<h3 class="type-h3">{{ title }}</h3>
		<p class="type-body-s text-ink-soft">{{ description }}</p>
		<UiTags :tags="tags" class="mt-auto pt-2" />
	</article>
</template>
