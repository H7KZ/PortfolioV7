<script setup lang="ts">
import type { HomeData } from '#shared/types/content'

const data = await useContent<HomeData>('home')
const { data: layout } = useLayoutContent()
const href = useHref()
const { track, trackLink } = useAnalytics()

const page = computed(() => data.value.page)
const portrait = computed(() => asMedia(page.value.portrait))
const recommendations = computed(() => {
	const label = page.value.allRecommendationsLabel
	const url = page.value.allRecommendationsUrl || layout.value?.site.linkedinUrl
	if (!label || !url) return null
	return { href: url, text: label.replace('{count}', String(data.value.testimonialCount)) }
})
const caption = computed(() => page.value.portraitCaption)
const headlineLines = computed(() => {
	const lines = (page.value.headline ?? '').split('\n')
	const last = lines.pop() ?? ''
	const cut = last.lastIndexOf(' ') + 1
	return { lines, lead: last.slice(0, cut), accent: last.slice(cut) }
})

useSeo(() => ({
	title: page.value.meta?.title ?? layout.value?.site.title ?? '',
	description: page.value.meta?.description,
	image: page.value.meta?.image,
	type: 'website'
}))

useHead(() => {
	const image = portrait.value
	const source = image?.formats.avif ?? image?.url
	return {
		link:
			image && source
				? [
						{
							key: 'preload-portrait',
							rel: 'preload',
							as: 'image',
							href: source,
							type: image.formats.avif ? 'image/avif' : (image.mimeType ?? undefined),
							fetchpriority: 'high'
						}
					]
				: []
	}
})
</script>

<template>
	<div>
		<section
			class="site-container grid grid-cols-1 gap-y-[22px] pt-12 pb-10 md:grid-cols-[minmax(0,1fr)_300px] md:grid-rows-[auto_auto_auto_auto_auto_1fr] md:gap-x-8 md:gap-y-0 md:pt-18 md:pb-14 lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-none lg:items-center lg:gap-x-12 lg:gap-y-0 lg:pt-24 lg:pb-16"
		>
			<div class="contents lg:flex lg:flex-col lg:items-start lg:gap-7">
				<p v-if="page.eyebrowCommand" class="type-mono-s break-words whitespace-pre-wrap text-mute md:col-span-2 md:mb-[26px] lg:col-auto lg:mb-0">
					<span class="text-accent" aria-hidden="true">$ </span
					><template v-if="page.eyebrowCommandShort"
						><span class="md:hidden">{{ page.eyebrowCommandShort }}</span
						><span class="hidden md:inline">{{ page.eyebrowCommand }}</span></template
					><template v-else>{{ page.eyebrowCommand }}</template>
				</p>
				<h1 class="type-display-xl md:col-span-2 md:mb-[26px] lg:col-auto lg:mb-0">
					<template v-for="line in headlineLines.lines" :key="line">{{ line }}<br /></template>{{ headlineLines.lead
					}}<span :class="headlineLines.lines.length ? 'text-accent' : undefined">{{ headlineLines.accent }}</span>
				</h1>
				<p class="max-w-[600px] type-body-l text-ink-soft md:col-start-1 md:mb-7 lg:col-auto lg:mb-0">{{ page.valueProp }}</p>
				<div class="flex flex-col gap-3 md:col-start-1 md:mb-7 lg:col-auto lg:mb-0 lg:flex-row">
					<UiButton block class="lg:w-auto" :to="href(page.primaryCta.href)">{{ page.primaryCta.label }}</UiButton>
					<UiButton block kind="secondary" class="lg:w-auto" :to="href(page.secondaryCta.href)">{{ page.secondaryCta.label }}</UiButton>
				</div>
				<p v-if="page.availability.detail" class="type-body-s text-mute md:col-start-1 lg:col-auto">
					{{ page.availability.detail }}
				</p>
			</div>

			<figure
				class="relative m-0 h-[400px] w-full overflow-hidden rounded-lg border border-line bg-surface md:col-start-2 md:row-span-5 md:row-start-3 md:self-start lg:row-span-1 lg:row-start-auto lg:h-[520px] lg:self-auto"
			>
				<div class="absolute top-[27px] left-1/2 aspect-[380/603] w-[270px] -translate-x-1/2 md:top-[23px] md:w-[244px] lg:top-[-43px] lg:w-[380px]">
					<ResponsiveImage v-if="portrait" :image="portrait" priority sizes="(min-width: 1024px) 380px, 90vw" img-class="object-top" />
				</div>
				<figcaption
					v-if="caption?.user"
					class="absolute bottom-[13px] left-[13px] flex items-center gap-2 rounded-sm border border-line-strong bg-bg px-3 py-[9px] type-mono-s whitespace-nowrap lg:bottom-[15px] lg:left-[15px] lg:px-3.5 lg:py-2.5"
				>
					<span class="text-accent">{{ caption.user }}</span>
					<span v-if="caption.path" class="hidden text-mute lg:inline">{{ caption.path }}</span>
					<span v-if="caption.note" class="text-ink-soft"><span aria-hidden="true">· </span>{{ caption.note }}</span>
				</figcaption>
			</figure>
		</section>

		<section v-if="page.now.items?.length" class="site-container pb-18 md:pb-24 lg:pb-30" aria-labelledby="now-label">
			<div class="flex flex-col gap-2.5 rounded-md border border-line bg-surface p-5 lg:gap-3.5 lg:px-7 lg:py-6">
				<h2 id="now-label" class="m-0 flex">
					<UiStatus tone="live">{{ page.now.label }}</UiStatus>
				</h2>
				<dl class="m-0 grid gap-y-2.5 md:gap-y-0 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-3">
					<div v-for="item in page.now.items" :key="item.id ?? item.key" class="flex items-start gap-2.5 md:items-center">
						<dt class="flex shrink-0 items-start gap-2.5 type-mono-s text-mute md:items-center">
							<span class="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true"></span>{{ item.key }}
						</dt>
						<dd class="m-0 type-body-s text-ink">{{ item.value }}</dd>
					</div>
				</dl>
			</div>
		</section>

		<section id="work" class="site-container flex scroll-mt-24 flex-col gap-7 pb-18 md:gap-9 md:pb-24 lg:gap-10 lg:pb-30">
			<SectionHeader :heading="page.work.heading" :sub="page.work.sub" />
			<ul class="grid list-none gap-4 p-0 md:grid-cols-2 lg:gap-6">
				<li v-for="(project, index) in data.projects" :key="project.slug" class="min-w-0">
					<ProjectCard
						:project="project"
						:link-label="page.readCaseStudyLabel"
						:priority="index === 0"
						@open="track('project-open', { project: project.slug })"
					/>
				</li>
			</ul>
		</section>

		<section v-if="page.more.items?.length" class="site-container flex flex-col gap-7 pb-18 md:gap-9 md:pb-24 lg:gap-10 lg:pb-36">
			<SectionHeader :heading="page.more.heading" :sub="page.more.sub" />
			<ul class="list-none p-0">
				<MoreWorkRow
					v-for="item in page.more.items"
					:key="item.id ?? item.title"
					:meta="item.meta"
					:title="item.title"
					:description="item.description"
					:link-label="item.linkLabel"
					:href="item.href"
					:external="item.external"
				/>
			</ul>
		</section>

		<section v-if="data.services.length" class="site-container flex flex-col gap-7 pb-18 md:gap-9 md:pb-24 lg:gap-10 lg:pb-36">
			<SectionHeader :heading="page.services.heading" :sub="page.services.sub" />
			<ul class="grid list-none gap-3 p-0 md:grid-cols-3 lg:gap-6">
				<li v-for="service in data.services" :key="service.id" class="min-w-0">
					<EngagementCard :label="service.label" :title="service.title" :description="service.description" :tags="service.chips" />
				</li>
			</ul>
		</section>

		<section v-if="data.testimonials.length" class="site-container flex flex-col gap-7 pb-18 md:gap-9 md:pb-24 lg:gap-10 lg:pb-36">
			<SectionHeader :heading="page.testimonials.heading" :sub="page.testimonials.sub" />
			<ul class="grid list-none gap-3 p-0 lg:grid-cols-3 lg:gap-6">
				<li v-for="testimonial in data.testimonials" :key="testimonial.id" class="min-w-0">
					<TestimonialCard :testimonial="testimonial" :limit="page.quoteLimit ?? 160" :read-more-label="page.readMoreLabel" />
				</li>
			</ul>
			<a
				v-if="recommendations"
				:href="recommendations.href"
				target="_blank"
				rel="noopener"
				class="-mt-[15px] inline-flex min-h-11 items-center self-start type-mono-s text-accent underline underline-offset-[3px] transition-colors duration-150 ease-(--ease) hover:text-accent-hover md:-mt-[23px] lg:-mt-[27px] [&>span[aria-hidden]]:inline-block"
				@click="trackLink(recommendations.href)"
				><GlyphLabel :text="recommendations.text" new-tab
			/></a>
		</section>
	</div>
</template>
