<script setup lang="ts">
import type { HomeData } from '#shared/types/content'

const data = await useContent<HomeData>('home')
const { data: layout } = useLayoutContent()
const href = useHref()
const { track } = useAnalytics()

const page = computed(() => data.value.page)
const portrait = computed(() => asMedia(page.value.portrait))
const caption = computed(() => page.value.portraitCaption)

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
		<section class="site-container grid gap-12 pt-12 pb-(--block-gap) md:pt-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:gap-16 lg:pt-24">
			<div class="flex flex-col gap-8">
				<p v-if="page.eyebrowCommand" class="type-mono-s break-words text-mute">
					<span class="text-accent" aria-hidden="true">$ </span>{{ page.eyebrowCommand }}
				</p>
				<h1 class="type-display-xl whitespace-pre-line">{{ page.headline }}</h1>
				<p class="max-w-[60ch] type-body-l text-ink-soft">{{ page.valueProp }}</p>
				<div class="flex flex-wrap gap-3">
					<UiButton :to="href(page.primaryCta.href)">{{ page.primaryCta.label }}</UiButton>
					<UiButton kind="secondary" :to="href(page.secondaryCta.href)">{{ page.secondaryCta.label }}</UiButton>
				</div>
				<p v-if="page.availability.detail" class="flex items-start gap-3 type-body-s text-ink-soft">
					<span class="live-dot mt-1.5" aria-hidden="true"></span>
					<span>{{ page.availability.detail }}</span>
				</p>
			</div>

			<figure class="m-0 w-full max-w-[360px] justify-self-center overflow-hidden rounded-lg border border-line bg-surface lg:justify-self-end">
				<div class="aspect-4/5 bg-surface-2">
					<ResponsiveImage v-if="portrait" :image="portrait" priority sizes="(min-width: 1024px) 360px, 90vw" img-class="object-top" />
				</div>
				<figcaption v-if="caption?.user" class="flex flex-wrap gap-x-2 border-t border-line px-4 py-3 type-mono-s text-ink-soft">
					<span
						><span class="text-accent">{{ caption.user }}</span> {{ caption.path }}</span
					>
					<span v-if="caption.note" class="text-mute"><span aria-hidden="true">· </span>{{ caption.note }}</span>
				</figcaption>
			</figure>
		</section>

		<section v-if="page.now.items?.length" class="site-container pb-(--section-gap)" aria-labelledby="now-label">
			<div class="grid gap-4 rounded-lg border border-line bg-surface p-6 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start lg:gap-8">
				<h2 id="now-label" class="flex items-center gap-2 type-mono-label text-accent">
					<span class="live-dot" aria-hidden="true"></span>{{ page.now.label }}
				</h2>
				<dl class="grid gap-x-8 gap-y-3 md:grid-cols-2 xl:grid-cols-4">
					<div v-for="item in page.now.items" :key="item.id ?? item.key" class="flex flex-col gap-1">
						<dt class="type-mono-label text-mute">{{ item.key }}</dt>
						<dd class="m-0 type-body-s text-ink">{{ item.value }}</dd>
					</div>
				</dl>
			</div>
		</section>

		<section id="work" class="site-container flex scroll-mt-24 flex-col gap-10 pb-(--section-gap) md:gap-12">
			<SectionHeader :heading="page.work.heading" :sub="page.work.sub" />
			<ul class="grid list-none gap-4 p-0 lg:grid-cols-2 lg:gap-6">
				<li v-for="(project, index) in data.projects" :key="project.slug">
					<ProjectCard
						:project="project"
						:link-label="page.readCaseStudyLabel"
						:priority="index === 0"
						@open="track('project-open', { project: project.slug })"
					/>
				</li>
			</ul>
		</section>

		<section v-if="page.more.items?.length" class="site-container flex flex-col gap-10 pb-(--section-gap) md:gap-12">
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

		<section v-if="data.services.length" class="site-container flex flex-col gap-10 pb-(--section-gap) md:gap-12">
			<SectionHeader :heading="page.services.heading" :sub="page.services.sub" />
			<ul class="grid list-none gap-4 p-0 lg:grid-cols-3 lg:gap-6">
				<li v-for="service in data.services" :key="service.id">
					<EngagementCard :label="service.label" :title="service.title" :description="service.description" :tags="service.chips" />
				</li>
			</ul>
		</section>

		<section v-if="data.testimonials.length" class="site-container flex flex-col gap-10 pb-(--section-gap) md:gap-12">
			<SectionHeader :heading="page.testimonials.heading" :sub="page.testimonials.sub" />
			<ul class="grid list-none gap-4 p-0 lg:grid-cols-3 lg:gap-6">
				<li v-for="testimonial in data.testimonials" :key="testimonial.id">
					<TestimonialCard :testimonial="testimonial" :limit="page.quoteLimit ?? 160" :read-more-label="page.readMoreLabel" />
				</li>
			</ul>
		</section>
	</div>
</template>
