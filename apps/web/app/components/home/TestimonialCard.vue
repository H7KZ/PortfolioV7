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
	<figure class="m-0 flex h-full flex-col gap-5 rounded-md border border-line bg-surface px-7 pt-7 pb-6">
		<span class="font-sans text-[64px] leading-9 font-bold tracking-[-1.9px] text-faint" aria-hidden="true">“</span>
		<blockquote class="m-0 type-quote text-wrap text-ink-soft" :lang="quoteLang">
			<p>
				{{ quote.text }}
				<a
					v-if="quote.truncated && testimonial.linkedinUrl"
					:href="testimonial.linkedinUrl"
					target="_blank"
					rel="noopener"
					class="whitespace-nowrap text-ink-soft no-underline hover:text-ink hover:underline hover:underline-offset-4"
					:lang="quoteLang ? locale : undefined"
					@click="trackLink(testimonial.linkedinUrl)"
					><GlyphLabel :text="readMoreLabel" new-tab
				/></a>
			</p>
		</blockquote>
		<div class="min-h-0 flex-1" aria-hidden="true"></div>
		<figcaption class="flex items-center gap-3 border-t border-line pt-[18px]">
			<span
				class="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-strong bg-surface-2 type-mono-s text-ink"
				aria-hidden="true"
				>{{ testimonial.initials }}</span
			>
			<span class="flex flex-col gap-0.5">
				<span class="type-body-medium text-ink">{{ testimonial.name }}</span>
				<span class="type-mono-s text-mute">{{ testimonial.role }}</span>
			</span>
		</figcaption>
	</figure>
</template>
