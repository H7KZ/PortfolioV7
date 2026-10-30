<script setup lang="ts">
import type { ResumeData } from '#shared/types/content'

const data = await useContent<ResumeData>('resume')
const href = useHref()
const { track } = useAnalytics()

const page = computed(() => data.value.page)
const portrait = computed(() => asMedia(page.value.portrait))
const name = computed(() => page.value.name.replace(/\.$/, ''))
const namePeriod = computed(() => page.value.name.endsWith('.'))

const SECTIONS = [
	{ kind: 'work', header: 'experience', id: 'experience' },
	{ kind: 'ownProduct', header: 'ownProduct', id: 'products' },
	{ kind: 'leadership', header: 'leadership', id: 'leadership' },
	{ kind: 'education', header: 'education', id: 'education' }
] as const

function entries(kind: string) {
	return data.value.experience.filter(entry => entry.kind === kind)
}

function sub(header: (typeof SECTIONS)[number]['header']): string | null | undefined {
	const section = page.value[header]
	return 'sub' in section ? section.sub : undefined
}

useSeo(() => ({
	title: page.value.meta?.title ?? `${page.value.name.replace(/\.$/, '')}`,
	description: page.value.meta?.description ?? page.value.bio,
	image: page.value.meta?.image,
	type: 'profile'
}))
</script>

<template>
	<div>
		<header class="site-container flex flex-col gap-4 pt-9 pb-7 md:gap-5 md:pt-14 md:pb-10 lg:flex-row lg:items-center lg:gap-14 lg:pt-[72px] lg:pb-14">
			<div v-if="portrait" class="size-28 shrink-0 overflow-hidden rounded-lg border border-line-strong bg-surface-2 md:size-40 lg:size-[300px]">
				<ResponsiveImage :image="portrait" priority sizes="(min-width: 1024px) 300px, 160px" img-class="object-top" />
			</div>
			<div class="flex min-w-0 flex-1 flex-col items-start gap-4 md:gap-5">
				<p class="type-mono-s text-mute"><span class="whitespace-pre text-accent" aria-hidden="true">$ </span>{{ page.label }}</p>
				<h1 class="font-sans text-[34px] leading-[1.04] font-bold tracking-[-1px] text-ink md:text-[52px] md:leading-none md:tracking-[-1.9px]">
					{{ name }}<span v-if="namePeriod" class="text-accent">.</span>
				</h1>
				<p class="type-mono-s text-mute lg:type-mono-m">{{ page.subtitle }}</p>
				<p class="max-w-[680px] font-sans text-[17px] leading-[1.52] text-ink-soft md:text-[18px]">{{ page.bio }}</p>
				<div class="flex w-full flex-col gap-3 md:w-auto md:flex-row">
					<UiButton v-if="page.cv" href="/cv.pdf" download @click="track('cv-download')"><GlyphLabel :text="page.downloadLabel" /></UiButton>
					<UiButton kind="secondary" :to="href(page.hireCta.href)">{{ page.hireCta.label }}</UiButton>
				</div>
			</div>
		</header>

		<div v-if="page.impact?.length" class="site-container pb-(--section-gap)">
			<dl class="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
				<StatTile
					v-for="item in page.impact"
					:key="item.id ?? item.label"
					class="max-lg:gap-2 max-lg:p-5 lg:min-h-[158px]"
					:label="item.label"
					:value="item.value"
					:sub="item.sub"
					:variant="item.style"
				/>
			</dl>
		</div>

		<section
			v-for="section in SECTIONS"
			:id="section.id"
			:key="section.kind"
			class="site-container scroll-mt-24 pb-12 md:pb-16 lg:pb-30"
			:aria-labelledby="`${section.id}-heading`"
		>
			<SectionHeader :id="`${section.id}-heading`" :heading="page[section.header].heading" :sub="sub(section.header)" />
			<ol class="m-0 list-none p-0 pt-7 pb-12 md:pt-9 lg:pt-12 lg:pl-[30%]">
				<TimelineItem v-for="entry in entries(section.kind)" :key="entry.id" :entry="entry" :show-tags="section.kind !== 'education'" />
			</ol>
		</section>

		<section class="site-container pb-(--section-gap)" aria-labelledby="skills-heading">
			<SectionHeader id="skills-heading" :heading="page.skills.heading" :sub="page.skills.sub" />
			<div class="grid grid-cols-2 gap-x-4 gap-y-6 pt-7 md:gap-x-4 md:pt-9 lg:grid-cols-4 lg:gap-x-6 lg:pt-12">
				<div v-for="(group, index) in page.skillGroups ?? []" :key="group.id ?? index" class="flex min-w-0 flex-col gap-2 lg:gap-2.5">
					<h3 class="m-0 type-mono-label text-mute">{{ group.title }}</h3>
					<div class="h-px w-full bg-line" aria-hidden="true"></div>
					<ul class="m-0 flex list-none flex-col gap-2 p-0 lg:gap-2.5">
						<li
							v-for="skill in group.skills ?? []"
							:key="skill.id ?? skill.name"
							class="flex items-center gap-2 type-body"
							:class="skill.primary ? 'text-ink' : 'text-ink-soft'"
						>
							{{ skill.name }}
							<template v-if="skill.primary">
								<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true"></span>
								<span v-if="page.primarySkillLabel" class="sr-only">{{ page.primarySkillLabel }}</span>
							</template>
						</li>
					</ul>
				</div>
			</div>
		</section>
	</div>
</template>
