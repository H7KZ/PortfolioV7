<script setup lang="ts">
import TablerArrowRight from '~icons/tabler/arrow-right'

import type { ProjectCard } from '#shared/types/content'

const { project, linkLabel, priority = false } = defineProps<{ project: ProjectCard; linkLabel: string; priority?: boolean }>()
const emit = defineEmits<{ open: [] }>()

const href = useHref()
const image = computed(() => asMedia(project.thumbnail))
</script>

<template>
	<article
		class="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition-colors duration-150 ease-(--ease) hover:border-line-strong has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-focus xl:flex-row"
	>
		<div class="relative aspect-16/10 shrink-0 overflow-hidden border-b border-line bg-surface-2 xl:aspect-auto xl:w-[44%] xl:border-r xl:border-b-0">
			<ResponsiveImage
				v-if="image"
				:image="image"
				alt=""
				:priority="priority"
				img-class="object-center xl:object-left-top"
				sizes="(min-width: 1440px) 260px, (min-width: 1024px) 50vw, 100vw"
			/>
			<ScreenshotPlaceholder v-else fill :label="project.heroPlaceholderLabel" :spec="project.heroPlaceholderSpec" class="border-0" />
			<span
				v-if="project.card?.badge"
				class="absolute top-3 left-3 rounded-full border border-line-strong bg-bg/85 px-2.5 py-1 type-mono-label text-ink backdrop-blur-sm"
				>{{ project.card.badge }}</span
			>
		</div>
		<div class="flex flex-1 flex-col gap-4 p-6">
			<p class="flex flex-wrap justify-between gap-x-4 gap-y-1 type-mono-label text-mute xl:flex-col xl:justify-start">
				<span>{{ project.card?.meta }}</span>
				<span>{{ project.card?.year }}</span>
			</p>
			<h3 class="type-h3">
				<NuxtLink
					:to="href(`/projects/${project.slug}`)"
					class="text-ink no-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
					@click="emit('open')"
					>{{ project.title }}</NuxtLink
				>
			</h3>
			<p class="type-body-s text-ink-soft">{{ project.card?.description }}</p>
			<UiTags :tags="project.card?.chips" class="mt-auto pt-2" />
			<p class="flex items-center gap-2 type-button text-ink" aria-hidden="true">
				{{ linkLabel }}
				<TablerArrowRight class="h-4 w-4 transition-transform duration-200 ease-(--ease) group-hover:translate-x-1" />
			</p>
		</div>
	</article>
</template>
