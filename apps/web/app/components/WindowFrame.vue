<script setup lang="ts">
import type { MediaView } from '#shared/types/content'

const {
	path,
	image,
	placeholderKicker,
	placeholderLabel,
	placeholderSpec,
	placeholderSuffix,
	priority = false,
	ratio,
	sizes = '(min-width: 1024px) 840px, 100vw'
} = defineProps<{
	path?: string | null
	image?: MediaView | null
	placeholderKicker?: string | null
	placeholderLabel?: string | null
	placeholderSpec?: string | null
	/** Appended to the path while the window shows a placeholder, e.g. "placeholder". */
	placeholderSuffix?: string | null
	priority?: boolean
	/** Tailwind aspect-ratio classes that crop the image area. Without them the window takes the image's own shape. */
	ratio?: string
	sizes?: string
}>()

/** Figma drops the projects/ segment from the path on a phone. */
const compactPath = computed(() => path?.replace(/^~\/projects\//, '~/'))
/** Figma shows the suffix from tablet up; on a phone the path stays short. */
const suffix = computed(() => (!image && placeholderSuffix ? ` · ${placeholderSuffix}` : ''))
const imageShape = computed(() => (!ratio && image?.width && image.height ? `${image.width} / ${image.height}` : undefined))
</script>

<template>
	<div class="overflow-hidden rounded-lg border border-line bg-surface">
		<div class="flex items-center gap-[7px] border-b border-line px-3 py-2.5 lg:gap-2 lg:px-4 lg:py-3" aria-hidden="true">
			<span v-for="dot in 3" :key="dot" class="h-2 w-2 shrink-0 rounded-full bg-line-strong lg:h-2.5 lg:w-2.5"></span>
			<span class="hidden h-px w-2 shrink-0 lg:block"></span>
			<template v-if="path">
				<span v-if="compactPath !== path" class="truncate type-mono-s text-faint md:hidden">{{ compactPath }}</span>
				<span class="truncate type-mono-s text-faint" :class="{ 'hidden md:inline': compactPath !== path }"
					>{{ path }}<span v-if="suffix" class="max-md:hidden">{{ suffix }}</span></span
				>
			</template>
		</div>
		<div class="bg-surface-2" :class="ratio ?? (imageShape ? undefined : 'aspect-16/10')" :style="{ aspectRatio: imageShape }">
			<ResponsiveImage v-if="image" :image="image" :priority="priority" :sizes="sizes" />
			<ScreenshotPlaceholder v-else fill :kicker="placeholderKicker" :label="placeholderLabel" :spec="placeholderSpec" />
		</div>
	</div>
</template>
