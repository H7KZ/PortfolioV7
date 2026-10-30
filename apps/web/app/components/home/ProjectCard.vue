<script setup lang="ts">
import type { ProjectCard } from '#shared/types/content'

const { project, linkLabel, priority = false } = defineProps<{ project: ProjectCard; linkLabel: string; priority?: boolean }>()
const emit = defineEmits<{ open: [] }>()

const href = useHref()
const image = computed(() => asMedia(project.thumbnail))
</script>

<template>
	<article
		class="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition-colors duration-150 ease-(--ease) hover:border-line-strong has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-focus"
	>
		<div class="relative flex h-62 shrink-0 items-start justify-between overflow-hidden bg-surface-2 p-4">
			<ResponsiveImage
				v-if="image"
				:image="image"
				alt=""
				:priority="priority"
				class="absolute inset-0"
				sizes="(min-width: 1440px) 588px, (min-width: 768px) 50vw, 100vw"
			/>
			<div
				v-else
				class="absolute inset-0 bg-[radial-gradient(circle,rgb(255_255_255/0.05)_1px,transparent_1.5px)] bg-size-[20px_20px]"
				aria-hidden="true"
			></div>
			<UiStatus v-if="project.card?.badge" tone="live" class="relative">{{ project.card.badge }}</UiStatus>
			<UiStatus v-if="project.card?.year" class="relative bg-bg!">{{ project.card.year }}</UiStatus>
		</div>
		<div class="flex flex-1 flex-col gap-3 px-6 pt-6 pb-[22px]">
			<p class="type-mono-label text-mute min-[400px]:whitespace-nowrap">{{ project.card?.meta }}</p>
			<h3 class="type-h3-desktop text-ink">
				<NuxtLink
					:to="href(`/projects/${project.slug}`)"
					class="text-ink no-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
					@click="emit('open')"
					>{{ project.title.replace(/\.$/, '') }}</NuxtLink
				>
			</h3>
			<p class="type-body text-ink-soft md:type-body-s">{{ project.card?.description }}</p>
			<UiTags :tags="project.card?.chips" />
			<div class="min-h-0 flex-1" aria-hidden="true"></div>
			<p class="flex items-start justify-between border-t border-line pt-4 type-mono-s" aria-hidden="true">
				<span class="text-ink">{{ linkLabel }}</span>
				<span class="text-accent transition-transform duration-200 ease-(--ease) group-hover:translate-x-1">→</span>
			</p>
		</div>
	</article>
</template>
