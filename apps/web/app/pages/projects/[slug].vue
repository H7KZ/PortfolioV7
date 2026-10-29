<script setup lang="ts">
import TablerArrowRight from '~icons/tabler/arrow-right'

import type { ProjectData } from '#shared/types/content'

const route = useRoute()
const data = await useContent<ProjectData>(`projects/${String(route.params.slug)}`)
const { data: layout } = useLayoutContent()
const absoluteUrl = useAbsoluteUrl()
const href = useHref()

const project = computed(() => data.value.project)
const labels = computed(() => data.value.labels)
const site = computed(() => layout.value?.site)
const hero = computed(() => asMedia(project.value.thumbnail))
const screens = computed(() =>
	[...(project.value.screens ?? [])]
		.map(screen => ({ ...screen, media: asMedia(screen.image ?? null) }))
		.sort((a, b) => Number(Boolean(b.media)) - Number(Boolean(a.media)))
)
const projectUrl = computed(() => absoluteUrl(`/projects/${project.value.slug}`))
const facts = computed(() =>
	[
		{ label: labels.value.roleLabel, value: project.value.role },
		{ label: labels.value.timelineLabel, value: project.value.timeline },
		{ label: labels.value.sectorLabel, value: project.value.sector }
	].filter(item => item.value)
)
const hasArchitecture = computed(() => (project.value.architecture?.nodes?.length ?? 0) > 0)

useSeo(() => ({
	title: project.value.meta?.title ?? project.value.title.replace(/\.$/, ''),
	description: project.value.meta?.description ?? project.value.lede,
	image: project.value.meta?.image ?? project.value.thumbnail,
	imageAlt: hero.value?.alt,
	type: 'article',
	extra: [
		{
			'@context': 'https://schema.org',
			'@type': 'CreativeWork',
			name: project.value.title.replace(/\.$/, ''),
			description: project.value.lede ?? project.value.title,
			url: projectUrl.value,
			dateCreated: project.value.date,
			creator: { '@type': 'Person', name: site.value?.name, url: site.value?.siteUrl },
			keywords: (project.value.stack ?? []).join(', '),
			image: hero.value ? absoluteUrl(hero.value.url) : undefined
		}
	]
}))

useHead(() => {
	const source = hero.value?.formats.avif ?? hero.value?.url
	return {
		link:
			hero.value && source
				? [
						{
							key: 'preload-hero',
							rel: 'preload',
							as: 'image',
							href: source,
							type: hero.value.formats.avif ? 'image/avif' : undefined,
							fetchpriority: 'high'
						}
					]
				: []
	}
})
</script>

<template>
	<article>
		<header class="site-container flex flex-col gap-8 pt-10 pb-(--block-gap) md:pt-14 lg:pt-20">
			<NuxtLink
				:to="href('/#work')"
				class="inline-flex min-h-11 items-center self-start type-button text-ink-soft no-underline transition-colors duration-150 ease-(--ease) hover:text-ink"
				><GlyphLabel :text="labels.backLabel"
			/></NuxtLink>
			<div class="flex max-w-[840px] flex-col gap-6">
				<p v-if="project.kicker" class="type-mono-label text-mute">{{ project.kicker }}</p>
				<h1 class="type-display-l">{{ project.title }}</h1>
				<p v-if="project.lede" class="max-w-[60ch] type-body-l text-ink-soft">{{ project.lede }}</p>
			</div>
			<dl v-if="facts.length" class="grid gap-6 border-t border-line pt-6 sm:grid-cols-3">
				<div v-for="fact in facts" :key="fact.label" class="flex flex-col gap-1">
					<dt class="type-mono-label text-mute">{{ fact.label }}</dt>
					<dd class="m-0 type-body-medium text-ink">{{ fact.value }}</dd>
				</div>
			</dl>
		</header>

		<div class="site-container pb-(--block-gap)">
			<WindowFrame
				:path="project.heroPath"
				:image="hero"
				priority
				sizes="(min-width: 1280px) 1200px, 100vw"
				:placeholder-kicker="labels.placeholderLabel"
				:placeholder-label="project.heroPlaceholderLabel"
				:placeholder-spec="project.heroPlaceholderSpec"
			/>
		</div>

		<div v-if="project.impact?.length" class="site-container pb-(--section-gap)">
			<dl class="grid gap-4 md:grid-cols-3 lg:gap-6">
				<StatTile v-for="item in project.impact" :key="item.id ?? item.label" :label="item.label" :value="item.value" :sub="item.sub" />
			</dl>
		</div>

		<section v-if="project.contentHtml" class="site-container section-grid pb-(--section-gap)" aria-labelledby="challenge">
			<h2 id="challenge" class="type-h2">{{ labels.challengeLabel }}</h2>
			<!-- eslint-disable-next-line vue/no-v-html -->
			<div class="prose-site prose" v-html="demoteHeadings(project.contentHtml)"></div>
		</section>

		<section v-if="project.contributions?.length" class="site-container section-grid pb-(--section-gap)" aria-labelledby="owned">
			<h2 id="owned" class="type-h2">{{ labels.contributionsLabel }}</h2>
			<ul class="grid list-none gap-4 p-0 md:grid-cols-2">
				<li v-for="item in project.contributions" :key="item.id ?? item.title" class="flex flex-col gap-3 rounded-lg border border-line bg-surface p-6">
					<h3 class="type-h4">{{ item.title }}</h3>
					<p class="type-body-s text-ink-soft">{{ item.body }}</p>
				</li>
			</ul>
		</section>

		<section v-if="hasArchitecture && project.architecture" class="site-container section-grid pb-(--section-gap)" aria-labelledby="architecture">
			<h2 id="architecture" class="type-h2">{{ labels.architectureLabel }}</h2>
			<ArchitectureDiagram :architecture="project.architecture" />
		</section>

		<section v-if="project.stack?.length" class="site-container section-grid pb-(--section-gap)" aria-labelledby="stack">
			<h2 id="stack" class="type-h2">{{ labels.stackLabel }}</h2>
			<UiTags :tags="project.stack" />
		</section>

		<div v-if="screens.length" class="site-container section-grid pb-(--section-gap)">
			<div class="max-lg:hidden"></div>
			<div class="flex flex-col gap-6 lg:gap-8">
				<WindowFrame
					v-for="screen in screens"
					:key="screen.id ?? screen.path ?? ''"
					:path="screen.path"
					:image="screen.media"
					:placeholder-kicker="labels.placeholderLabel"
					:placeholder-label="screen.placeholderLabel"
					:placeholder-spec="screen.placeholderSpec"
				/>
			</div>
		</div>

		<nav v-if="data.next" class="site-container pb-(--section-gap)" :aria-label="labels.nextLabel ?? undefined">
			<NuxtLink
				:to="href(`/projects/${data.next.slug}`)"
				class="group flex items-center justify-between gap-6 border-t border-b border-line py-8 no-underline"
			>
				<span class="flex flex-col gap-2">
					<span class="type-mono-label text-mute">{{ labels.nextLabel }}</span>
					<span class="type-h2 text-ink">{{ data.next.title }}</span>
				</span>
				<TablerArrowRight
					class="h-6 w-6 shrink-0 text-ink transition-transform duration-200 ease-(--ease) group-hover:translate-x-1"
					aria-hidden="true"
				/>
			</NuxtLink>
		</nav>
	</article>
</template>
