<script setup lang="ts">
import type { MediaView } from '#shared/types/content'

const {
	path,
	image,
	placeholderKicker,
	placeholderLabel,
	placeholderSpec,
	priority = false,
	ratio = 'aspect-16/10',
	sizes = '(min-width: 1024px) 840px, 100vw'
} = defineProps<{
	path?: string | null
	image?: MediaView | null
	placeholderKicker?: string | null
	placeholderLabel?: string | null
	placeholderSpec?: string | null
	priority?: boolean
	/** Tailwind aspect-ratio classes for the image area, per breakpoint when the Figma crop changes. */
	ratio?: string
	sizes?: string
}>()
</script>

<template>
	<div class="overflow-hidden rounded-lg border border-line bg-surface">
		<div class="flex items-center gap-[7px] border-b border-line px-3 py-2.5 lg:gap-2 lg:px-4 lg:py-3" aria-hidden="true">
			<span v-for="dot in 3" :key="dot" class="h-2 w-2 shrink-0 rounded-full bg-line-strong lg:h-2.5 lg:w-2.5"></span>
			<span class="hidden h-px w-2 shrink-0 lg:block"></span>
			<span v-if="path" class="truncate type-mono-s text-faint">{{ path }}</span>
		</div>
		<div class="bg-surface-2" :class="ratio">
			<ResponsiveImage v-if="image" :image="image" :priority="priority" :sizes="sizes" />
			<ScreenshotPlaceholder v-else fill :kicker="placeholderKicker" :label="placeholderLabel" :spec="placeholderSpec" />
		</div>
	</div>
</template>
