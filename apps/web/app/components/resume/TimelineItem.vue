<script setup lang="ts">
import type { Resolved } from '#shared/types/content'
import type { Experience } from '@portfolio/content'

const { entry, showTags = true } = defineProps<{ entry: Resolved<Experience>; showTags?: boolean }>()

const highlights = computed(() => (entry.highlights ?? []).slice(0, 3))
</script>

<template>
	<li class="group flex gap-6">
		<div class="flex w-[22px] shrink-0 flex-col items-center gap-1.5 self-stretch" aria-hidden="true">
			<span class="grid h-[22px] w-[22px] shrink-0 place-items-center">
				<span v-if="entry.current" class="h-3.5 w-3.5 rounded-full bg-accent"></span>
				<span v-else class="h-2.5 w-2.5 rounded-full border-2 border-faint bg-bg"></span>
			</span>
			<span class="w-0.5 flex-1 bg-line-strong group-last:hidden"></span>
		</div>
		<div class="flex min-w-0 flex-1 flex-col items-start gap-2.5 pb-12 group-last:pb-0">
			<p class="type-mono-s text-mute">
				{{ entry.dates
				}}<template v-if="entry.duration"><span aria-hidden="true"> · </span><span class="sr-only">, </span>{{ entry.duration }}</template>
			</p>
			<h3
				class="font-sans text-[20px] leading-[1.25] font-medium tracking-[-0.3px] text-wrap text-ink md:text-[22px] md:leading-[1.22] md:tracking-[-0.4px]"
			>
				{{ entry.role }}
			</h3>
			<p class="type-mono-label text-ink-soft">{{ entry.organization }}</p>
			<p v-if="entry.description" class="max-w-[680px] type-body text-wrap text-ink-soft">{{ entry.description }}</p>
			<ul v-if="highlights.length" class="m-0 flex w-full list-none flex-col gap-1.5 p-0">
				<li v-for="highlight in highlights" :key="highlight.id ?? highlight.text" class="max-w-[680px] type-body text-wrap text-ink-soft">
					<span aria-hidden="true">– </span>{{ highlight.text }}
				</li>
			</ul>
			<UiTags v-if="showTags" :tags="(entry.chips ?? []).map(chip => chip.label)" />
		</div>
	</li>
</template>
