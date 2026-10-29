<script setup lang="ts">
import type { Resolved } from '#shared/types/content'
import type { Testimonial } from '@portfolio/content'

const { testimonial, limit, readMoreLabel } = defineProps<{ testimonial: Resolved<Testimonial>; limit: number; readMoreLabel: string }>()

const locale = useLocaleCode()
const { trackLink } = useAnalytics()
const quote = computed(() => truncateWords(testimonial.quote, limit))
const quoteLang = computed(() => (testimonial.quoteLanguage && testimonial.quoteLanguage !== locale.value ? testimonial.quoteLanguage : undefined))
</script>

<template>
	<figure class="m-0 flex h-full flex-col gap-6 rounded-lg border border-line bg-surface p-6">
		<blockquote class="m-0 type-quote text-ink-soft" :lang="quoteLang">
			<p>
				{{ quote.text }}
				<a
					v-if="quote.truncated && testimonial.linkedinUrl"
					:href="testimonial.linkedinUrl"
					target="_blank"
					rel="noopener"
					class="type-body-s whitespace-nowrap text-ink underline decoration-control underline-offset-4 hover:decoration-ink"
					:lang="quoteLang ? locale : undefined"
					@click="trackLink(testimonial.linkedinUrl)"
					><GlyphLabel :text="readMoreLabel" new-tab
				/></a>
			</p>
		</blockquote>
		<figcaption class="mt-auto flex items-center gap-3 border-t border-line pt-5">
			<span
				class="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-strong bg-surface-2 type-mono-label text-ink-soft"
				aria-hidden="true"
				>{{ testimonial.initials }}</span
			>
			<span class="flex flex-col">
				<span class="type-body-medium text-ink">{{ testimonial.name }}</span>
				<span class="type-body-s text-mute">{{ testimonial.role }}</span>
			</span>
		</figcaption>
	</figure>
</template>
