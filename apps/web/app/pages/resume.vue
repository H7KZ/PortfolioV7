<script setup lang="ts">
import type { ResumeData } from '#shared/types/content'

const data = await useContent<ResumeData>('resume')
const href = useHref()
const { track } = useAnalytics()

const page = computed(() => data.value.page)
const portrait = computed(() => asMedia(page.value.portrait))

const SECTIONS = [
	{ kind: 'work', header: 'experience', showChips: true },
	{ kind: 'ownProduct', header: 'ownProduct', showChips: true },
	{ kind: 'leadership', header: 'leadership', showChips: true },
	{ kind: 'education', header: 'education', showChips: false }
] as const

function entries(kind: string) {
	return data.value.experience.filter(entry => entry.kind === kind)
}

useSeo(() => ({
	title: page.value.meta?.title ?? page.value.name,
	description: page.value.meta?.description,
	image: page.value.meta?.image,
	type: 'profile'
}))
</script>

<template>
	<div>
		<!-- RESUME HEADER -->
		<div
			class="mx-auto mb-16 grid max-w-(--max) grid-cols-[auto_1fr] items-center gap-12 border-b border-(--line) px-8 pt-10 pb-16 max-[700px]:grid-cols-1 max-[700px]:gap-7 max-[700px]:px-5 max-[700px]:pt-7 max-[700px]:pb-10"
		>
			<div
				class="h-65 w-65 shrink-0 overflow-hidden rounded-lg border border-(--line-2) bg-linear-to-br from-[#2a2a2a] to-[#161616] max-[700px]:h-30 max-[700px]:w-30"
			>
				<img
					v-if="portrait"
					:src="portrait.url"
					:alt="portrait.alt"
					:width="portrait.width ?? undefined"
					:height="portrait.height ?? undefined"
					loading="lazy"
					decoding="async"
					class="h-full w-full object-cover object-top"
				/>
			</div>
			<div>
				<div class="mono mb-3.5 text-[11px] tracking-widest text-(--fg-4) uppercase">{{ page.label }}</div>
				<h1 class="serif m-0 mb-1.5 text-[clamp(36px,5.5vw,64px)] leading-none tracking-[-0.025em]">
					{{ page.name }}<span class="text-(--fg-3)">.</span>
				</h1>
				<p class="mono m-0 mb-5 text-[13px] tracking-[0.02em] text-(--fg-3)">{{ page.subtitle }}</p>
				<p class="m-0 max-w-140 text-[15px] leading-[1.65] text-(--fg-2)">{{ page.bio }}</p>
				<div class="mt-6 flex flex-wrap gap-3">
					<a
						v-if="page.cv"
						href="/cv.pdf"
						download
						class="no-print inline-flex items-center gap-2 rounded-full bg-(--fg) px-5 py-2.75 text-[14px] font-medium text-(--bg) no-underline transition-all duration-200 hover:bg-(--accent)"
						@click="track('cv-download')"
					>
						{{ page.downloadLabel }}
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 3v13M5 10l7 7 7-7M3 21h18" />
						</svg>
					</a>
					<NuxtLink
						:to="href(page.hireCta.href)"
						class="no-print inline-flex items-center gap-2 rounded-full border border-(--line-2) px-5 py-2.75 text-[14px] text-(--fg) no-underline transition-all duration-200 hover:border-(--fg-3)"
						>{{ page.hireCta.label }}</NuxtLink
					>
				</div>
			</div>
		</div>

		<!-- IMPACT BAND -->
		<div v-if="page.impact?.length" class="mx-auto mb-25 max-w-(--max) px-8 max-sm:px-5">
			<div class="grid grid-cols-4 overflow-hidden rounded-(--radius) border border-(--line) bg-(--bg-2) max-md:grid-cols-2">
				<div
					v-for="(item, index) in page.impact"
					:key="item.id ?? index"
					class="border-r border-(--line) p-6 last:border-r-0 max-md:nth-[-n+2]:border-b max-md:nth-[-n+2]:border-b-(--line) max-md:nth-[2n]:border-r-0"
				>
					<div class="mono mb-3 text-[10px] tracking-widest text-(--fg-4) uppercase">{{ item.label }}</div>
					<div v-if="item.style === 'text'" class="mono text-[18px] leading-none tracking-[-0.02em]">{{ item.value }}</div>
					<div v-else-if="item.style === 'accent'" class="mono text-[18px] leading-none text-(--accent)">{{ item.value }}</div>
					<div v-else class="serif text-[34px] leading-none tracking-[-0.02em]">{{ item.value }}</div>
					<div class="mono mt-1.5 text-[11px] text-(--fg-4)">{{ item.sub }}</div>
				</div>
			</div>
		</div>

		<!-- TIMELINES -->
		<section v-for="section in SECTIONS" :key="section.kind" class="mx-auto mb-25 max-w-(--max) px-8 max-sm:px-5">
			<SectionHeader
				:label="page[section.header].label"
				:heading="page[section.header].heading"
				:sub="'sub' in page[section.header] ? (page[section.header] as { sub?: string | null }).sub : undefined"
				heading-size="text-[clamp(24px,3vw,42px)]"
			/>

			<div class="timeline relative pl-8">
				<div v-for="entry in entries(section.kind)" :key="entry.id" class="tl-item relative pb-10" :class="entry.current ? 'current' : ''">
					<div class="mono mb-1 text-[11px] tracking-[0.06em] text-(--fg-4)">
						{{ entry.dates }} <span class="ml-1.5 text-(--fg-3)">· {{ entry.duration }}</span>
					</div>
					<h3 class="m-0 mb-1 text-[18px] font-medium">{{ entry.role }}</h3>
					<div class="mono mb-2.5 text-[12px] tracking-[0.02em] text-(--accent)">{{ entry.organization }}</div>
					<p class="m-0 mb-3 text-[14px] leading-[1.55] text-(--fg-2)">{{ entry.description }}</p>
					<ul v-if="entry.highlights?.length" class="tl-highlights m-0 mb-3 flex list-none flex-col gap-1.25 p-0">
						<li
							v-for="highlight in entry.highlights"
							:key="highlight.id ?? highlight.text"
							class="relative pl-3.5 text-[13px] leading-normal text-(--fg-3)"
						>
							{{ highlight.text }}
						</li>
					</ul>
					<div v-if="section.showChips && entry.chips?.length" class="flex flex-wrap gap-1.25">
						<span v-for="chip in entry.chips" :key="chip.id ?? chip.label" class="chip" :class="chip.accent ? 'accent' : ''">{{ chip.label }}</span>
					</div>
				</div>
			</div>
		</section>

		<!-- SKILLS -->
		<section class="mx-auto mb-25 max-w-(--max) px-8 max-sm:px-5">
			<SectionHeader :label="page.skills.label" :heading="page.skills.heading" :sub="page.skills.sub" heading-size="text-[clamp(24px,3vw,42px)]" />

			<div class="grid grid-cols-4 gap-8 max-[480px]:grid-cols-1 max-md:grid-cols-2">
				<div v-for="(group, index) in page.skillGroups ?? []" :key="group.id ?? index">
					<h4 class="mono m-0 mb-3.5 border-b border-(--line) pb-2.5 text-[10px] font-medium tracking-[0.12em] text-(--fg-4) uppercase">
						{{ group.title }}
					</h4>
					<div class="flex flex-col gap-2 text-[14px]">
						<span
							v-for="skill in group.skills ?? []"
							:key="skill.id ?? skill.name"
							class="skill"
							:class="skill.primary ? 'primary font-medium text-(--fg)' : 'text-(--fg-2)'"
							>{{ skill.name }}</span
						>
					</div>
				</div>
			</div>
		</section>

		<div class="mx-auto max-w-(--max) px-8 pb-32 max-sm:px-5">
			<ContactFooter />
		</div>
	</div>
</template>

<style scoped>
@media print {
	:global(header),
	:global(.grid-bg),
	:global(footer) {
		display: none !important;
	}

	:global(body) {
		background: #fff !important;
		color: #111 !important;
	}

	:global(#main-content) {
		padding: 0 !important;
	}

	.no-print {
		display: none !important;
	}

	section,
	div[class*='mb-'] {
		margin-bottom: 1.5rem !important;
	}

	.tl-item {
		break-inside: avoid;
	}

	.timeline,
	.grid {
		break-inside: avoid;
	}
}

.timeline::before {
	content: '';
	position: absolute;
	left: 5px;
	top: 8px;
	bottom: 8px;
	width: 1px;
	background: var(--line-2);
}

.tl-item::before {
	content: '';
	position: absolute;
	left: -30px;
	top: 10px;
	width: 11px;
	height: 11px;
	border-radius: 50%;
	background: var(--bg);
	border: 2px solid var(--fg-3);
}

.tl-item.current::before {
	background: var(--accent);
	border-color: var(--accent);
	box-shadow: 0 0 12px var(--accent);
}

.tl-highlights li::before {
	content: '\2014';
	position: absolute;
	left: 0;
	color: var(--fg-5);
}

.skill.primary::after {
	content: '';
	display: inline-block;
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background: var(--accent);
	margin-left: 8px;
	vertical-align: middle;
	transform: translateY(-2px);
}
</style>
