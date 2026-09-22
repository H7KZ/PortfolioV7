import type { MediaView, Relation } from '#shared/types/content'

export function asMedia(value: Relation): MediaView | null {
	return typeof value === 'object' && value !== null ? value : null
}
