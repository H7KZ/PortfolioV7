<script setup lang="ts">
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
const title = computed(() => {
	const raw = project.value.title
	return raw.endsWith('.') ? { text: raw.slice(0, -1), dot: true } : { text: raw, dot: false }
})
const SECTION = 'site-container grid lg:grid-cols-[minmax(0,360fr)_minmax(0,840fr)] lg:gap-0'
const HEADING = 'm-0 type-h3 text-ink md:text-[22px] md:leading-[1.22] md:tracking-[-0.4px]'
/** Figma crops each screenshot per breakpoint; WindowFrame only knows 16:10, so the page sets the ratio on its image area. */
const HERO_RATIO = '[&>div:nth-child(2)]:aspect-[348/245] md:[&>div:nth-child(2)]:aspect-[686/413] lg:[&>div:nth-child(2)]:aspect-[1198/680]'
const HERO_PLACEHOLDER_RATIO = '[&>div:nth-child(2)]:aspect-[348/271] md:[&>div:nth-child(2)]:aspect-[1198/671]'
const SHOT_PLACEHOLDER_RATIO = '[&>div:nth-child(2)]:aspect-[348/271] md:[&>div:nth-child(2)]:aspect-[16/10]'
const SHOT_RATIO = '[&>div:nth-child(2)]:aspect-[348/203] md:[&>div:nth-child(2)]:aspect-[686/399] lg:[&>div:nth-child(2)]:aspect-[1198/640]'
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
		<header class="site-container">
			<div class="flex flex-col gap-4 pt-6 pb-7 md:gap-[18px] md:pt-11 md:pb-10 lg:flex-row lg:items-end lg:gap-16 lg:pt-[72px] lg:pb-14">
				<div class="flex min-w-0 flex-col items-start gap-4 md:gap-[18px] lg:flex-1 lg:gap-5">
					<NuxtLink
						:to="href('/#work')"
						class="inline-flex min-h-11 items-center type-mono-s text-ink-soft no-underline transition-colors duration-150 ease-(--ease) hover:text-ink [&>span[aria-hidden]]:mr-[0.6em] [&>span[aria-hidden]]:text-accent"
						><GlyphLabel :text="labels.backLabel"
					/></NuxtLink>
					<p v-if="project.kicker" class="type-mono-label text-mute">{{ project.kicker }}</p>
					<h1 class="text-[34px] leading-[1.04] font-bold tracking-[-1px] text-ink md:text-[52px] md:leading-none md:tracking-[-1.9px]">
						{{ title.text }}<span v-if="title.dot" class="text-accent">.</span>
					</h1>
					<p v-if="project.lede" class="max-w-[700px] type-body-l text-wrap text-ink-soft md:text-[18px]">{{ project.lede }}</p>
				</div>
				<dl v-if="facts.length" class="m-0 grid w-full md:grid-cols-3 md:gap-6 lg:w-[340px] lg:shrink-0 lg:grid-cols-1 lg:gap-0">
					<div v-for="fact in facts" :key="fact.label" class="flex flex-col gap-1 border-t border-line py-3 lg:py-3.5">
						<dt class="type-mono-label text-faint">{{ fact.label }}</dt>
						<dd class="m-0 type-body text-wrap text-ink">{{ fact.value }}</dd>
					</div>
				</dl>
			</div>
		</header>

		<div class="site-container" :class="project.impact?.length ? 'pb-4 lg:pb-6' : 'pb-(--section-gap)'">
			<WindowFrame
				:path="project.heroPath"
				:image="hero"
				priority
				:class="hero ? HERO_RATIO : HERO_PLACEHOLDER_RATIO"
				sizes="(min-width: 1280px) 1200px, 100vw"
				:placeholder-kicker="labels.placeholderLabel"
				:placeholder-label="project.heroPlaceholderLabel"
				:placeholder-spec="project.heroPlaceholderSpec"
			/>
		</div>

		<div v-if="project.impact?.length" class="site-container pb-(--section-gap)">
			<dl
				class="m-0 grid gap-2 md:grid-cols-(--cols) md:gap-3 lg:gap-6"
				:style="{ '--cols': `repeat(${Math.min(project.impact.length, 3)}, minmax(0, 1fr))` }"
			>
				<StatTile v-for="item in project.impact" :key="item.id ?? item.label" :label="item.label" :value="item.value" :sub="item.sub" />
			</dl>
		</div>

		<section v-if="project.contentHtml" :class="[SECTION, 'gap-4 pb-(--block-gap)']" aria-labelledby="challenge">
			<h2 id="challenge" :class="HEADING">{{ labels.challengeLabel }}</h2>
			<!-- eslint-disable-next-line vue/no-v-html -->
			<div
				class="prose-site prose max-w-[760px]! [&>p]:m-0 [&>p]:text-[17px] [&>p]:leading-[1.52] [&>p]:text-wrap md:[&>p]:text-[18px] lg:[&>p]:leading-[1.5] [&>p+p]:mt-4 lg:[&>p+p]:mt-5"
				v-html="demoteHeadings(project.contentHtml)"
			></div>
		</section>

		<section v-if="project.contributions?.length" :class="[SECTION, 'gap-3 pb-(--block-gap)']" aria-labelledby="owned">
			<h2 id="owned" :class="HEADING">{{ labels.contributionsLabel }}</h2>
			<ul class="m-0 grid list-none gap-3 p-0 md:grid-cols-2 lg:gap-5">
				<li
					v-for="item in project.contributions"
					:key="item.id ?? item.title"
					class="flex flex-col gap-2.5 rounded-md border border-line bg-surface p-5 md:pb-12 lg:min-h-[218px] lg:p-6 lg:pb-[54px]"
				>
					<h3 class="m-0 type-h4 text-ink">{{ item.title }}</h3>
					<p class="m-0 type-body text-wrap text-ink-soft">{{ item.body }}</p>
				</li>
			</ul>
		</section>

		<section v-if="hasArchitecture && project.architecture" :class="[SECTION, 'gap-3.5 pb-(--block-gap)']" aria-labelledby="architecture">
			<h2 id="architecture" :class="HEADING">{{ labels.architectureLabel }}</h2>
			<ArchitectureDiagram :architecture="project.architecture" />
		</section>

		<section v-if="project.stack?.length" :class="[SECTION, 'gap-3.5 pb-(--block-gap)']" aria-labelledby="stack">
			<h2 id="stack" :class="HEADING">{{ labels.stackLabel }}</h2>
			<UiTags :tags="project.stack" />
		</section>

		<div v-if="screens.length" class="site-container flex flex-col gap-4 pb-(--section-gap) lg:gap-6">
			<WindowFrame
				v-for="screen in screens"
				:key="screen.id ?? screen.path ?? ''"
				:path="screen.path"
				:image="screen.media"
				:class="screen.media ? SHOT_RATIO : SHOT_PLACEHOLDER_RATIO"
				sizes="(min-width: 1280px) 1200px, 100vw"
				:placeholder-kicker="labels.placeholderLabel"
				:placeholder-label="screen.placeholderLabel"
				:placeholder-spec="screen.placeholderSpec"
			/>
		</div>

		<nav v-if="data.next" class="site-container pb-[72px] md:pb-24" :aria-label="labels.nextLabel ?? undefined">
			<NuxtLink
				:to="href(`/projects/${data.next.slug}`)"
				class="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 rounded-md border border-line-strong bg-surface p-5 no-underline md:p-7 lg:gap-y-2 lg:rounded-lg lg:px-9 lg:py-8"
			>
				<span class="type-mono-label text-accent">{{ labels.nextLabel }}</span>
				<span
					class="col-start-1 row-start-2 text-[20px] leading-[1.25] font-medium tracking-[-0.3px] text-ink md:text-[22px] md:leading-[1.22] md:tracking-[-0.4px]"
					>{{ data.next.title.replace(/\.$/, '') }}</span
				>
				<svg
					class="col-start-2 row-start-2 my-[5.5px] h-4 w-5 shrink-0 text-accent transition-transform duration-200 ease-(--ease) group-hover:translate-x-1 md:my-2 md:h-[19px] md:w-[26px] lg:row-span-2 lg:row-start-1 lg:my-0"
					viewBox="0 0 26 19"
					fill="none"
					stroke="currentColor"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M2 9.5H23M15.5 2L23 9.5L15.5 17" />
				</svg>
			</NuxtLink>
		</nav>
	</article>
</template>
