<script setup lang="ts">
import type { ResumeData } from '#shared/types/content'

const data = await useContent<ResumeData>('resume')
const href = useHref()
const { track } = useAnalytics()

const page = computed(() => data.value.page)

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
		<header class="site-container flex flex-col gap-8 pt-10 pb-(--block-gap) md:pt-14 lg:pt-20">
			<p class="type-mono-s break-words text-mute"><span class="text-accent" aria-hidden="true">$ </span>{{ page.label }}</p>
			<div class="flex max-w-[840px] flex-col gap-4">
				<h1 class="type-display-l">{{ page.name }}</h1>
				<p class="type-body-medium text-ink">{{ page.subtitle }}</p>
				<p class="max-w-[64ch] type-body-l text-ink-soft">{{ page.bio }}</p>
			</div>
			<div class="flex flex-wrap gap-3">
				<UiButton v-if="page.cv" href="/cv.pdf" download @click="track('cv-download')"><GlyphLabel :text="page.downloadLabel" /></UiButton>
				<UiButton kind="secondary" :to="href(page.hireCta.href)">{{ page.hireCta.label }}</UiButton>
			</div>
		</header>

		<div v-if="page.impact?.length" class="site-container pb-(--section-gap)">
			<dl class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
				<StatTile
					v-for="item in page.impact"
					:key="item.id ?? item.label"
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
			class="site-container section-grid scroll-mt-24 pb-(--section-gap)"
			:aria-labelledby="`${section.id}-heading`"
		>
			<div class="flex flex-col gap-3 lg:pr-12">
				<h2 :id="`${section.id}-heading`" class="type-h2">{{ page[section.header].heading }}</h2>
				<p v-if="sub(section.header)" class="type-body text-ink-soft">{{ sub(section.header) }}</p>
			</div>
			<ol class="relative list-none p-0 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-line-strong">
				<TimelineItem v-for="entry in entries(section.kind)" :key="entry.id" :entry="entry" :show-tags="section.kind !== 'education'" />
			</ol>
		</section>

		<section class="site-container section-grid pb-(--section-gap)" aria-labelledby="skills-heading">
			<div class="flex flex-col gap-3 lg:pr-12">
				<h2 id="skills-heading" class="type-h2">{{ page.skills.heading }}</h2>
				<p v-if="page.skills.sub" class="type-body text-ink-soft">{{ page.skills.sub }}</p>
			</div>
			<div class="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
				<div v-for="(group, index) in page.skillGroups ?? []" :key="group.id ?? index" class="flex flex-col gap-4">
					<h3 class="border-b border-line pb-3 type-mono-label text-mute">{{ group.title }}</h3>
					<ul class="flex list-none flex-col gap-2 p-0">
						<li
							v-for="skill in group.skills ?? []"
							:key="skill.id ?? skill.name"
							class="flex items-center gap-2 type-body-s"
							:class="skill.primary ? 'text-ink' : 'text-ink-soft'"
						>
							{{ skill.name }}
							<template v-if="skill.primary">
								<span class="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true"></span>
								<span v-if="page.primarySkillLabel" class="sr-only">{{ page.primarySkillLabel }}</span>
							</template>
						</li>
					</ul>
				</div>
			</div>
		</section>
	</div>
</template>
