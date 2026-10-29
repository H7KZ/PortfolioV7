<script setup lang="ts">
import type { Resolved } from '#shared/types/content'
import type { Experience } from '@portfolio/content'

const { entry, showTags = true } = defineProps<{ entry: Resolved<Experience>; showTags?: boolean }>()

const highlights = computed(() => (entry.highlights ?? []).slice(0, 3))
</script>

<template>
	<li class="relative flex flex-col gap-3 pb-10 pl-8 last:pb-0">
		<span
			class="absolute top-1.5 left-0 h-3 w-3 rounded-full border-2"
			:class="entry.current ? 'border-accent bg-accent shadow-[0_0_0_4px_var(--color-accent-soft)]' : 'border-control bg-bg'"
			aria-hidden="true"
		></span>
		<p class="type-mono-s text-mute">
			{{ entry.dates }}<template v-if="entry.duration"><span aria-hidden="true"> · </span><span class="sr-only">, </span>{{ entry.duration }}</template>
		</p>
		<div class="flex flex-col gap-1">
			<h3 class="type-h3">{{ entry.role }}</h3>
			<p class="type-body-s text-ink-soft">{{ entry.organization }}</p>
		</div>
		<p v-if="entry.description" class="max-w-[68ch] type-body text-ink-soft">{{ entry.description }}</p>
		<ul v-if="highlights.length" class="flex max-w-[68ch] list-disc flex-col gap-1.5 pl-5 type-body-s text-ink-soft marker:text-control">
			<li v-for="highlight in highlights" :key="highlight.id ?? highlight.text">{{ highlight.text }}</li>
		</ul>
		<UiTags v-if="showTags" :tags="(entry.chips ?? []).map(chip => chip.label)" class="pt-1" />
	</li>
</template>
