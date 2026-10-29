<script setup lang="ts">
import type { MediaView } from '#shared/types/content'

const {
	path,
	image,
	placeholderKicker,
	placeholderLabel,
	placeholderSpec,
	priority = false,
	wide = false,
	sizes = '(min-width: 1024px) 840px, 100vw'
} = defineProps<{
	path?: string | null
	image?: MediaView | null
	placeholderKicker?: string | null
	placeholderLabel?: string | null
	placeholderSpec?: string | null
	priority?: boolean
	/** The page hero uses the wider 1198:671 crop, gallery shots stay 16:10. */
	wide?: boolean
	sizes?: string
}>()
</script>

<template>
	<div class="overflow-hidden rounded-lg border border-line bg-surface">
		<div class="flex items-center gap-2 border-b border-line px-4 py-3" aria-hidden="true">
			<span v-for="dot in 3" :key="dot" class="h-2.5 w-2.5 shrink-0 rounded-full bg-line-strong"></span>
			<span class="h-px w-2 shrink-0"></span>
			<span v-if="path" class="truncate type-mono-s text-faint">{{ path }}</span>
		</div>
		<div v-if="image" class="bg-surface-2" :class="wide ? 'aspect-[1198/671]' : 'aspect-16/10'">
			<ResponsiveImage :image="image" :priority="priority" :sizes="sizes" />
		</div>
		<ScreenshotPlaceholder v-else :kicker="placeholderKicker" :label="placeholderLabel" :spec="placeholderSpec" :class="wide ? 'aspect-[1198/671]!' : ''" />
	</div>
</template>
