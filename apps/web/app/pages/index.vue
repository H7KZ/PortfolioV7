<script setup lang="ts">
import type { HomeData, ProjectCard } from '#shared/types/content'

const data = await useContent<HomeData>('home')
const href = useHref()
const { track } = useAnalytics()

const page = computed(() => data.value.page)
const portrait = computed(() => asMedia(page.value.portrait))

function sizeClass(project: ProjectCard): string {
	switch (project.card?.size) {
		case 'featured':
			return 'col-span-6 flex-row min-h-[420px] max-[900px]:col-span-2 max-[900px]:flex-col max-[900px]:min-h-0 max-[560px]:col-span-1'
		case 'wide':
			return 'col-span-4 flex-col max-[900px]:col-span-2 max-[560px]:col-span-1'
		case 'narrow':
			return 'col-span-2 flex-col max-[560px]:col-span-1'
		default:
			return 'col-span-3 flex-col max-[900px]:col-span-2 max-[560px]:col-span-1'
	}
}

function quote(text: string): { text: string; truncated: boolean } {
	const limit = page.value.quoteLimit ?? 450
	return text.length > limit ? { text: text.slice(0, limit).trimEnd(), truncated: true } : { text, truncated: false }
}

useSeo(() => ({
	title: page.value.meta?.title ?? `${page.value.firstName} ${page.value.lastName}`,
	description: page.value.meta?.description,
	image: page.value.meta?.image,
	type: 'website'
}))

useHead(() => ({
	link: portrait.value
		? [
				{
					key: 'preload-portrait',
					rel: 'preload',
					as: 'image',
					href: portrait.value.url,
					type: portrait.value.mimeType ?? undefined,
					fetchpriority: 'high'
				}
			]
		: []
}))
</script>

<template>
	<div>
		<p v-if="page.geoSummary" class="sr-only">{{ page.geoSummary }}</p>

		<!-- HERO -->
		<div
			class="mx-auto grid max-w-(--max) grid-cols-[1fr_auto] items-start gap-x-20 px-8 pt-10 pb-30 max-[900px]:grid-cols-1 max-[900px]:gap-6 max-[900px]:pb-16 max-sm:px-5"
		>
			<div class="mono col-1 mb-8 flex flex-wrap gap-x-4 gap-y-1 text-[12px] tracking-[0.04em] text-(--fg-3)">
				<template v-for="(tagline, index) in page.taglines ?? []" :key="tagline.id ?? index">
					<span v-if="index > 0" class="text-(--fg-5)">/</span>
					<span :class="index === 0 ? 'text-(--fg)' : ''">{{ tagline.text }}</span>
				</template>
			</div>

			<h1 class="serif col-1 m-0 mb-6 text-[clamp(52px,9vw,120px)] leading-[0.95] tracking-[-0.03em]">
				{{ page.firstName }}<br /><em class="text-(--fg-2) italic">{{ page.lastName }}</em>
			</h1>

			<!-- eslint-disable-next-line vue/no-v-html -->
			<p
				class="hero-value-prop col-1 m-0 mb-8 max-w-150 text-[clamp(18px,2.2vw,26px)] leading-[1.4] font-light tracking-[-0.015em] text-(--fg-2)"
				v-html="emphasis(page.valueProp)"
			></p>

			<div class="col-1 flex flex-wrap gap-3">
				<NuxtLink
					:to="href(page.primaryCta.href)"
					class="inline-flex items-center gap-2 rounded-full bg-(--fg) px-5.5 py-3.25 text-[14px] font-medium text-(--bg) no-underline transition-all duration-200 hover:bg-(--accent)"
				>
					<span>{{ page.primaryCta.label }}</span>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M5 12h14M13 6l6 6-6 6" />
					</svg>
				</NuxtLink>
				<NuxtLink
					:to="href(page.secondaryCta.href)"
					class="inline-flex items-center gap-2 rounded-full border border-(--line-2) px-5.5 py-3.25 text-[14px] text-(--fg) no-underline transition-all duration-200 hover:border-(--fg-3)"
				>
					<span>{{ page.secondaryCta.label }}</span>
				</NuxtLink>
			</div>

			<div class="col-1 mt-12 flex flex-wrap gap-10 border-t border-(--line) pt-7">
				<div v-for="(stat, index) in page.stats ?? []" :key="stat.id ?? index" class="flex flex-col gap-1">
					<div class="serif text-[36px] leading-none">{{ stat.value }}</div>
					<div class="mono text-[10px] tracking-widest text-(--fg-4) uppercase">{{ stat.label }}</div>
				</div>
			</div>

			<div
				class="relative col-2 row-start-1 row-end-6 h-120 w-88 self-center overflow-hidden rounded-[180px_180px_12px_12px] border border-(--line-2) bg-linear-to-b from-[#2a2a2a] to-[#181818] max-[900px]:col-1 max-[900px]:row-auto max-[900px]:mx-auto max-[900px]:h-100 max-[900px]:w-full max-[900px]:max-w-[320px]"
			>
				<img
					v-if="portrait"
					:src="portrait.url"
					:alt="portrait.alt"
					:width="portrait.width ?? undefined"
					:height="portrait.height ?? undefined"
					fetchpriority="high"
					decoding="async"
					class="h-full w-full object-cover"
				/>
				<div
					class="mono absolute right-3.5 bottom-3.5 left-3.5 flex items-center gap-2 rounded-lg border border-(--line-2) bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] px-3 py-2.25 text-[11px] backdrop-blur-sm"
				>
					<span
						class="h-2 w-2 shrink-0 animate-[dot-pulse_2.4s_ease-in-out_infinite] rounded-full bg-(--accent) shadow-[0_0_10px_var(--accent)]"
					></span>
					<span class="text-(--fg)">{{ page.availability.status }}</span>
					<span class="ml-auto text-(--fg-4)">{{ page.availability.detail }}</span>
				</div>
			</div>
		</div>

		<!-- NOW SECTION -->
		<div class="mx-auto mb-24 max-w-(--max) px-8 max-sm:px-5">
			<div
				class="grid grid-cols-[auto_1fr_auto] items-center gap-7 rounded-(--radius) border border-(--line) bg-(--bg-2) px-7 py-6 max-[700px]:grid-cols-1 max-[700px]:gap-3"
			>
				<div class="mono text-[11px] tracking-widest text-(--accent) uppercase">◆ {{ page.now.label }}</div>
				<div>
					<h3 class="serif m-0 mb-1.5 text-[20px]">{{ page.now.title }}</h3>
					<p class="m-0 text-[14px] leading-[1.55] text-(--fg-3)">{{ page.now.description }}</p>
				</div>
				<div class="mono text-right text-[12px] whitespace-nowrap text-(--fg-4) max-[700px]:text-left">
					<div>{{ page.now.date }}</div>
					<div class="mt-1 text-(--fg-3)">{{ page.now.meta }}</div>
				</div>
			</div>
		</div>

		<!-- PROJECTS BENTO -->
		<section class="mx-auto mb-35 max-w-(--max) px-8 max-sm:px-5">
			<SectionHeader :label="`${page.work.label} · ${data.projectCount}`" :heading="page.work.heading" :sub="page.work.sub" />

			<div class="grid grid-cols-6 gap-3.5 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
				<NuxtLink
					v-for="project in data.projects"
					:key="project.slug"
					:to="href(`/projects/${project.slug}`)"
					class="group relative flex overflow-hidden rounded-lg border border-(--line) bg-(--bg-2) text-(--fg) no-underline transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-(--fg-5)"
					:class="sizeClass(project)"
					@click="track('project-open', { project: project.slug })"
				>
					<div
						class="relative overflow-hidden bg-(--bg-3)"
						:class="
							project.card?.size === 'featured'
								? 'flex-[1.2] border-r border-(--line) max-[900px]:aspect-16/10 max-[900px]:flex-none max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:border-(--line)'
								: 'aspect-16/10 border-b border-(--line)'
						"
					>
						<img
							v-if="asMedia(project.thumbnail)"
							:src="asMedia(project.thumbnail)!.url"
							:alt="project.title"
							loading="lazy"
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
						/>
						<span
							v-if="project.card?.badge"
							class="mono absolute top-2.5 left-2.5 z-2 rounded-full border border-(--line-2) bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] px-2.5 py-1 text-[10px] tracking-[0.08em] text-(--fg-2) uppercase backdrop-blur-sm"
							>{{ project.card.badge }}</span
						>
						<span
							class="mono absolute top-2.5 right-2.5 z-2 rounded-full bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] px-2.5 py-1 text-[11px] text-(--fg-2) backdrop-blur-sm"
							>{{ new Date(project.date).getUTCFullYear() }}</span
						>
					</div>
					<div class="flex flex-1 flex-col gap-3" :class="project.card?.size === 'featured' ? 'flex-1 justify-between p-9 max-[900px]:p-5' : 'p-4.5'">
						<div>
							<div class="mono mb-2 text-[10px] tracking-[0.08em] text-(--fg-4) uppercase">
								{{ project.card?.company }}<span class="mx-2 text-(--fg-5)">/</span>{{ project.card?.role }}
							</div>
							<h3
								class="serif m-0 mb-1.5 leading-[1.15] tracking-[-0.01em]"
								:class="project.card?.size === 'featured' ? 'text-[36px]' : 'text-[22px]'"
							>
								{{ project.title }}
							</h3>
							<p class="m-0 leading-normal text-(--fg-3)" :class="project.card?.size === 'featured' ? 'text-base' : 'text-[14px]'">
								{{ project.card?.description }}
							</p>
						</div>
						<div>
							<div v-if="project.card?.chips?.length" class="mb-3.5 flex flex-wrap gap-1.25">
								<span v-for="chip in project.card.chips" :key="chip" class="chip">{{ chip }}</span>
							</div>
							<div class="mono flex items-center justify-between border-t border-(--line) pt-2.5 text-[11px] tracking-[0.04em] text-(--fg-4)">
								<span>{{ project.card?.cta === 'readCaseStudy' ? page.readCaseStudyLabel : page.viewProjectLabel }}</span>
								<span class="text-(--fg-2) transition-[transform,color] duration-200 group-hover:translate-x-1 group-hover:text-(--accent)"
									>→</span
								>
							</div>
						</div>
					</div>
				</NuxtLink>
			</div>
		</section>

		<!-- SERVICES -->
		<section class="mx-auto mb-35 max-w-(--max) px-8 max-sm:px-5">
			<SectionHeader :label="page.services.label" :heading="page.services.heading" :sub="page.services.sub" />

			<div class="grid grid-cols-3 gap-3.5 max-md:grid-cols-1">
				<div
					v-for="service in data.services"
					:key="service.id"
					class="group relative overflow-hidden rounded-(--radius) border border-(--line) bg-(--bg-2) p-6 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-(--fg-5)"
				>
					<div class="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-(--accent)/[0.05] to-transparent"></div>
					<div
						class="mono mb-5 inline-flex rounded-full border border-(--accent)/20 bg-(--accent)/[0.06] px-3 py-1 text-[11px] tracking-widest text-(--accent)"
					>
						{{ service.number }}
					</div>
					<h3 class="serif m-0 mb-2.5 text-[22px]">{{ service.title }}</h3>
					<p class="m-0 text-[14px] leading-[1.55] text-(--fg-3)">{{ service.description }}</p>
					<div class="mt-4.5 flex flex-wrap gap-1.5">
						<span v-for="chip in service.chips ?? []" :key="chip" class="chip">{{ chip }}</span>
					</div>
				</div>
			</div>
		</section>

		<!-- TESTIMONIALS -->
		<section class="mx-auto mb-35 max-w-(--max) px-8 max-sm:px-5">
			<SectionHeader :label="page.testimonials.label" :heading="page.testimonials.heading" :sub="page.testimonials.sub" />

			<div class="grid grid-cols-2 gap-3.5 max-md:grid-cols-1">
				<div
					v-for="testimonial in data.testimonials"
					:key="testimonial.id"
					class="flex flex-col overflow-hidden rounded-(--radius) border border-(--line) bg-(--bg-2) p-6"
				>
					<blockquote class="serif relative z-[1] m-0 flex-1 pb-5 text-[15px] leading-[1.65] font-light tracking-[-0.005em] text-(--fg-2)">
						<span class="text-(--accent)" style="opacity: 0.75">"</span>{{ quote(testimonial.quote).text
						}}<template v-if="quote(testimonial.quote).truncated"
							><span class="text-(--fg-4)">…</span>{{ ' '
							}}<a
								:href="testimonial.linkedinUrl ?? '#'"
								target="_blank"
								rel="noopener noreferrer"
								class="mono text-[11px] text-(--accent) no-underline transition-opacity hover:opacity-80"
								>{{ page.readMoreLabel }}</a
							></template
						><span v-else class="text-(--accent)" style="opacity: 0.75">"</span>
					</blockquote>
					<div class="flex items-center gap-3 border-t border-(--line) pt-4">
						<div
							class="serif grid h-10 w-10 shrink-0 place-items-center rounded-full border border-(--line-2) bg-linear-to-br from-[#3a3a3a] to-[#1a1a1a] text-[13px] text-(--fg-3)"
						>
							{{ testimonial.initials }}
						</div>
						<div class="flex flex-col gap-0.5">
							<div class="text-[14px] font-medium">{{ testimonial.name }}</div>
							<div class="mono text-[11px] text-(--fg-4)">{{ testimonial.role }}</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- CONTACT FOOTER -->
		<div class="mx-auto max-w-(--max) px-8 pb-32 max-sm:px-5">
			<ContactFooter />
		</div>
	</div>
</template>

<style scoped>
.hero-value-prop :deep(strong) {
	color: var(--fg);
	font-weight: 500;
}
</style>
