import type { MediaView, Relation } from '#shared/types/content'

const SMALL_WIDTH = 800
const MEDIUM_WIDTH = 1600

export function asMedia(value: Relation): MediaView | null {
	return typeof value === 'object' && value !== null ? value : null
}

function srcset(image: MediaView, full: string | null, small: string | null, medium: string | null): string | undefined {
	if (!full) return undefined
	const entries = [
		small ? `${small} ${SMALL_WIDTH}w` : null,
		medium ? `${medium} ${MEDIUM_WIDTH}w` : null,
		image.width ? `${full} ${image.width}w` : full
	].filter(Boolean)
	return entries.join(', ')
}

export function avifSrcset(image: MediaView): string | undefined {
	return srcset(image, image.formats.avif, image.formats.avif800, image.formats.avif1600)
}

export function webpSrcset(image: MediaView): string | undefined {
	return srcset(image, image.url, image.formats.webp800, image.formats.webp1600)
}

/** Without the srcset, the preload fetches the largest file and the image then fetches the size it needs as well. */
export function imagePreload(key: string, image: MediaView, sizes: string) {
	const avif = avifSrcset(image)
	return {
		key,
		rel: 'preload' as const,
		as: 'image' as const,
		href: image.formats.avif ?? image.url,
		imagesrcset: avif ?? webpSrcset(image),
		imagesizes: sizes,
		type: avif ? 'image/avif' : (image.mimeType ?? undefined),
		fetchpriority: 'high' as const
	}
}
