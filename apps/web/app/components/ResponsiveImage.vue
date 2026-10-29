<script setup lang="ts">
import type { MediaView } from '#shared/types/content'

const {
	image,
	sizes = '100vw',
	priority = false,
	alt
} = defineProps<{
	image: MediaView
	sizes?: string
	priority?: boolean
	/** Overrides the media alt text, e.g. empty when the image repeats nearby text. */
	alt?: string
}>()

const SMALL_WIDTH = 800

function srcset(full: string | null, small: string | null): string | undefined {
	if (!full) return undefined
	const entries = [small ? `${small} ${SMALL_WIDTH}w` : null, image.width ? `${full} ${image.width}w` : full].filter(Boolean)
	return entries.join(', ')
}

const avif = computed(() => srcset(image.formats.avif, image.formats.avif800))
const webp = computed(() => srcset(image.url, image.formats.webp800))
</script>

<template>
	<picture>
		<source v-if="avif" type="image/avif" :srcset="avif" :sizes="sizes" />
		<img
			:src="image.url"
			:srcset="webp"
			:sizes="sizes"
			:alt="alt ?? image.alt"
			:width="image.width ?? undefined"
			:height="image.height ?? undefined"
			:loading="priority ? 'eager' : 'lazy'"
			:fetchpriority="priority ? 'high' : undefined"
			decoding="async"
			class="block h-full w-full object-cover"
		/>
	</picture>
</template>
