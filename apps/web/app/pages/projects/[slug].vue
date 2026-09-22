<script setup lang="ts">
import type { ProjectData } from '#shared/types/content'

const route = useRoute()
const data = await useContent<ProjectData>(`projects/${String(route.params.slug)}`)
const { data: layout } = useLayoutContent()
const absoluteUrl = useAbsoluteUrl()
const href = useHref()
const locale = useLocaleCode()

const project = computed(() => data.value.project)
const labels = computed(() => data.value.labels)
const site = computed(() => layout.value?.site)
const thumbnail = computed(() => asMedia(project.value.thumbnail))
const gallery = computed(() => (project.value.gallery ?? []).map(item => asMedia(item)).filter(item => item !== null))

const isRich = computed(() => project.value.layout === 'caseStudy')
const projectUrl = computed(() => absoluteUrl(`/projects/${project.value.slug}`))
const summary = computed(
	() => project.value.lede ?? (project.value.tags ?? []).filter(tag => !['Work', 'Personal'].includes(tag)).join(', ') ?? project.value.title
)

const metaItems = computed(() =>
	[
		project.value.role ? { label: labels.value.roleLabel, value: project.value.role } : null,
		project.value.team ? { label: labels.value.teamLabel, value: project.value.team } : null,
		project.value.timeline ? { label: labels.value.timelineLabel, value: project.value.timeline } : null,
		project.value.sector ? { label: labels.value.sectorLabel, value: project.value.sector } : null
	].filter(item => item !== null)
)

useSeo(() => ({
	title: project.value.meta?.title ?? `${project.value.title} · ${site.value?.name ?? ''}`,
	description: project.value.meta?.description ?? `${project.value.title}. ${summary.value.replace(/\.$/, '')}. ${labels.value.metaSuffix ?? ''}`.trim(),
	image: project.value.meta?.image ?? project.value.thumbnail,
	type: 'article',
	extra: [
		{
			'@context': 'https://schema.org',
			'@type': 'CreativeWork',
			name: project.value.title,
			description: project.value.lede ?? project.value.title,
			url: projectUrl.value,
			dateCreated: project.value.date,
			creator: { '@type': 'Person', name: site.value?.name, url: site.value?.siteUrl },
			keywords: summary.value,
			image: thumbnail.value ? absoluteUrl(thumbnail.value.url) : undefined,
			genre: (project.value.tags ?? []).join(', ')
		}
	]
}))
</script>

<template>
	<div v-if="isRich" class="mx-auto max-w-(--max) px-8 pt-10 pb-0 max-sm:px-5">
		<NuxtLink
			:to="href('/')"
			class="mono mb-10 inline-block text-[12px] tracking-[0.06em] text-(--fg-4) no-underline transition-colors duration-150 hover:text-(--fg)"
			>{{ labels.backLabel }}</NuxtLink
		>

		<div class="mb-16 grid grid-cols-[2fr_1fr] gap-12 border-b border-(--line) pb-8 max-md:grid-cols-1 max-md:gap-8">
			<div>
				<div class="mb-5 flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-[0.08em] text-(--fg-4) uppercase">
					<span>{{ labels.caseStudyLabel }}</span>
					<template v-if="project.client">
						<span class="inline-block h-1 w-1 rounded-full bg-(--fg-5)"></span>
						<span>{{ project.client }}</span>
					</template>
					<span class="inline-block h-1 w-1 rounded-full bg-(--fg-5)"></span>
					<span>{{ formatDate(project.date, 'en', { year: 'numeric', timeZone: 'UTC' }) }}</span>
				</div>
				<h1 class="serif m-0 mb-5 text-[clamp(40px,6vw,80px)] leading-[1] font-light tracking-[-0.03em] text-(--fg)">
					{{ project.title }}<span class="text-(--fg-3)">.</span>
				</h1>
				<p class="m-0 max-w-[640px] text-[clamp(16px,1.5vw,20px)] leading-[1.45] text-(--fg-2)">{{ project.lede }}</p>
			</div>

			<div v-if="metaItems.length > 0" class="grid grid-cols-2 content-center gap-x-8 gap-y-6 max-sm:grid-cols-2">
				<div v-for="item in metaItems" :key="item.label">
					<div class="mb-1 font-mono text-[10px] tracking-[0.1em] text-(--fg-4) uppercase">{{ item.label }}</div>
					<div class="text-[14px] text-(--fg)">{{ item.value }}</div>
				</div>
			</div>
		</div>

		<div v-if="thumbnail" class="mb-16 aspect-[16/7] overflow-hidden rounded-(--radius-lg) border border-(--line)">
			<img :src="thumbnail.url" :alt="project.title" class="h-full w-full object-cover" />
		</div>

		<div
			v-if="project.impact?.length"
			class="mb-16 grid overflow-hidden rounded-(--radius) border border-(--line) bg-(--bg-2)"
			:style="{ gridTemplateColumns: `repeat(${project.impact.length}, 1fr)` }"
		>
			<div
				v-for="(item, index) in project.impact"
				:key="item.id ?? item.label"
				class="p-7 last:border-0 max-sm:border-r-0 max-sm:border-b max-sm:border-(--line)"
				:class="index < project.impact.length - 1 ? 'border-r border-(--line)' : ''"
			>
				<div class="mb-3.5 font-mono text-[10px] tracking-[0.1em] text-(--fg-4) uppercase">◆ {{ item.label }}</div>
				<div class="serif text-[36px] leading-[1] font-light tracking-[-0.02em] text-(--fg)">{{ item.value }}</div>
				<div class="mt-1.5 font-mono text-[12px] text-(--fg-4)">{{ item.sub }}</div>
			</div>
		</div>

		<div class="mb-24 grid grid-cols-[200px_1fr] gap-12 max-md:grid-cols-1 max-md:gap-4">
			<div class="pt-2 font-mono text-[11px] tracking-[0.1em] text-(--fg-4) uppercase">{{ labels.challengeLabel }}</div>
			<!-- eslint-disable-next-line vue/no-v-html -->
			<article
				class="project-prose prose max-w-[680px] text-[15px] leading-[1.7] text-(--fg-2) prose-neutral prose-invert prose-code:bg-neutral-800! prose-pre:bg-neutral-800!"
				v-html="project.contentHtml"
			></article>
		</div>

		<div v-if="project.contributions?.length" class="mb-24 grid grid-cols-[200px_1fr] gap-12 max-md:grid-cols-1 max-md:gap-4">
			<div class="pt-2 font-mono text-[11px] tracking-[0.1em] text-(--fg-4) uppercase">{{ labels.contributionsLabel }}</div>
			<div class="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
				<div v-for="item in project.contributions" :key="item.id ?? item.title" class="rounded-(--radius) border border-(--line) bg-(--bg-2) p-5">
					<div class="mb-3 font-mono text-[11px] tracking-[0.08em] text-(--accent)">{{ item.num }}</div>
					<h4 class="m-0 mb-2 text-[15px] font-medium text-(--fg)">{{ item.title }}</h4>
					<p class="m-0 text-[13px] leading-[1.5] text-(--fg-3)">{{ item.body }}</p>
				</div>
			</div>
		</div>

		<div v-if="project.stack?.length" class="mb-16 grid grid-cols-[200px_1fr] gap-12 max-md:grid-cols-1 max-md:gap-4">
			<div class="pt-2 font-mono text-[11px] tracking-[0.1em] text-(--fg-4) uppercase">{{ labels.stackLabel }}</div>
			<div class="flex flex-wrap gap-1.5">
				<span v-for="tech in project.stack" :key="tech" class="chip">{{ tech }}</span>
			</div>
		</div>

		<div v-if="gallery.length" class="mb-16 grid gap-3 max-sm:grid-cols-1" :style="{ gridTemplateColumns: `repeat(${Math.min(gallery.length, 3)}, 1fr)` }">
			<div v-for="image in gallery" :key="image.url" class="aspect-video overflow-hidden rounded-(--radius) border border-(--line)">
				<img :src="image.url" alt="" class="h-full w-full object-cover" loading="lazy" />
			</div>
		</div>

		<ContactFooter />
	</div>

	<div v-else class="mx-auto max-w-(--max) px-8 max-sm:px-5">
		<div class="mx-auto max-w-200 pt-10">
			<NuxtLink
				:to="href('/')"
				class="mono mb-8 inline-block text-[12px] tracking-[0.06em] text-(--fg-4) no-underline transition-colors duration-150 hover:text-(--fg)"
				>{{ labels.backLabel }}</NuxtLink
			>

			<header class="mb-8">
				<div class="mb-4 flex flex-wrap items-center gap-1.5">
					<span v-for="tag in project.tags ?? []" :key="tag" class="chip">{{ tag }}</span>
					<span class="mono ml-1 text-[11px] text-(--fg-4)">{{
						formatDate(project.date, locale, { month: 'long', year: 'numeric', timeZone: 'UTC' })
					}}</span>
				</div>
				<h1 class="serif m-0 text-[clamp(28px,5vw,48px)] leading-[1.1] tracking-[-0.025em] text-(--fg)">{{ project.title }}</h1>
			</header>

			<div v-if="thumbnail" class="mb-12 overflow-hidden rounded-lg border border-(--line)">
				<img :src="thumbnail.url" :alt="project.title" class="block h-auto w-full" />
			</div>

			<!-- eslint-disable-next-line vue/no-v-html -->
			<article
				class="project-prose prose w-full text-[16px] leading-[1.7] text-(--fg-2) prose-neutral prose-invert prose-code:bg-neutral-800! prose-pre:bg-neutral-800!"
				v-html="project.contentHtml"
			></article>

			<ContactFooter />
		</div>
	</div>
</template>

<style scoped>
.project-prose :deep(h1),
.project-prose :deep(h2),
.project-prose :deep(h3),
.project-prose :deep(h4) {
	color: var(--fg);
	font-family: var(--font-serif), serif;
	font-weight: 300;
	letter-spacing: -0.02em;
}

.project-prose :deep(p) {
	color: var(--fg-2);
}

.project-prose :deep(a) {
	color: var(--accent);
	text-decoration-color: var(--accent-ring);
}

.project-prose :deep(a:hover) {
	text-decoration-color: var(--accent);
}

.project-prose :deep(hr) {
	border-color: var(--line);
}

.project-prose :deep(blockquote) {
	border-left-color: var(--accent-ring);
	color: var(--fg-3);
}

.project-prose :deep(pre),
.project-prose :deep(code) {
	background: var(--bg-3) !important;
	border: 1px solid var(--line);
}

.project-prose :deep(img) {
	border-radius: var(--radius);
	border: 1px solid var(--line);
}

.project-prose :deep(table th) {
	color: var(--fg);
	border-color: var(--line-2);
}

.project-prose :deep(table td) {
	border-color: var(--line);
}

.project-prose :deep(.bg-neutral-900) {
	background: var(--bg-2) !important;
	border: 1px solid var(--line);
	border-radius: var(--radius-lg);
}
</style>
