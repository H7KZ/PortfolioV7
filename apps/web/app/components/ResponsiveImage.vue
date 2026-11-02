<script setup lang="ts">
import type { MediaView } from '#shared/types/content'

const {
	image,
	sizes = '100vw',
	priority = false,
	alt,
	imgClass = 'object-center'
} = defineProps<{
	image: MediaView
	sizes?: string
	priority?: boolean
	/** Overrides the media alt text, e.g. empty when the image repeats nearby text. */
	alt?: string
	/** Object position of the crop, e.g. object-top for portraits. */
	imgClass?: string
}>()

const avif = computed(() => avifSrcset(image))
const webp = computed(() => webpSrcset(image))
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
			:class="imgClass"
		/>
	</picture>
</template>
