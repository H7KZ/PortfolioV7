<script setup lang="ts">
import type { MediaView } from '#shared/types/content'

const {
	path,
	image,
	placeholderKicker,
	placeholderLabel,
	placeholderSpec,
	priority = false,
	sizes = '(min-width: 1024px) 840px, 100vw'
} = defineProps<{
	path?: string | null
	image?: MediaView | null
	placeholderKicker?: string | null
	placeholderLabel?: string | null
	placeholderSpec?: string | null
	priority?: boolean
	sizes?: string
}>()
</script>

<template>
	<div class="overflow-hidden rounded-lg border border-line bg-surface">
		<div class="flex h-10 items-center gap-3 border-b border-line px-4" aria-hidden="true">
			<span class="flex gap-1.5">
				<span v-for="dot in 3" :key="dot" class="h-2.5 w-2.5 rounded-full bg-line-strong"></span>
			</span>
			<span v-if="path" class="truncate type-mono-s text-faint">{{ path }}</span>
		</div>
		<div v-if="image" class="aspect-16/10 bg-surface-2">
			<ResponsiveImage :image="image" :priority="priority" :sizes="sizes" />
		</div>
		<ScreenshotPlaceholder v-else :kicker="placeholderKicker" :label="placeholderLabel" :spec="placeholderSpec" class="border-0" />
	</div>
</template>
