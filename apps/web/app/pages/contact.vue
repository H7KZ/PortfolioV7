<script setup lang="ts">
import type { ContactFormConfig } from '@portfolio/content/contact-form'

import type { ContactData } from '#shared/types/content'

definePageMeta({ contactCta: false })

const data = await useContent<ContactData>('contact')
const { data: layout } = useLayoutContent()
const { calUrl } = useSiteText()
const { track, trackLink } = useAnalytics()

const page = computed(() => data.value.page)
const site = computed(() => layout.value?.site)
const headingPeriod = computed(() => page.value.heading.endsWith('.'))
const headingPlain = computed(() => (headingPeriod.value ? page.value.heading.slice(0, -1) : page.value.heading))

useSeo(() => ({
	title: page.value.meta?.title ?? page.value.heading.replace(/\n/g, ' '),
	description: page.value.meta?.description ?? page.value.intro,
	image: page.value.meta?.image,
	type: 'website'
}))
const headingFlat = computed(() => headingPlain.value.replace(/\s*\n\s*/g, ' '))
</script>

<template>
	<div class="site-container flex flex-col pb-(--section-gap) lg:flex-row lg:items-start lg:gap-12 lg:pt-18 lg:pb-36">
		<div class="flex flex-col pb-6 lg:min-w-0 lg:flex-1 lg:gap-6 lg:pb-0">
			<div class="flex flex-col gap-4 pt-9 pb-6 md:gap-5 md:pt-14 md:pb-8 lg:gap-6 lg:pt-0 lg:pb-0">
				<p class="type-mono-s text-mute"><span class="text-accent" aria-hidden="true">$ </span>{{ page.label }}</p>
				<h1 class="type-display-l text-[34px] tracking-[-1px] md:text-[52px] md:tracking-[-1.9px]">
					<span class="whitespace-pre-line max-lg:hidden">{{ headingPlain }}</span
					><span class="lg:hidden">{{ headingFlat }}</span
					><span v-if="headingPeriod" class="text-accent">.</span>
				</h1>
				<p class="type-body-l [text-wrap:wrap] text-ink-soft md:text-[18px]">{{ page.intro }}</p>
			</div>

			<ul class="flex list-none flex-col gap-2.5 p-0 lg:gap-3">
				<li v-if="site">
					<ChannelRow
						icon="@"
						:label="page.emailLabel"
						:sub="page.emailSub ?? site.email"
						:href="`mailto:${site.email}`"
						@select="trackLink('mailto:')"
					/>
				</li>
				<li v-if="site">
					<ChannelRow
						icon="in"
						:label="page.linkedinLabel"
						:sub="page.linkedinSub"
						:href="site.linkedinUrl"
						external
						@select="trackLink(site.linkedinUrl)"
					/>
				</li>
				<li v-if="calUrl">
					<ChannelRow
						:label="page.bookCallLabel"
						:sub="page.bookCallSub"
						:href="calUrl"
						external
						@select="track('book-call', { from: 'contact-channels' })"
					>
						<template #icon>cal</template>
					</ChannelRow>
				</li>
			</ul>

			<section class="flex flex-col gap-2.5 rounded-lg border border-line bg-surface p-6 max-lg:hidden" aria-labelledby="include-title">
				<h2 id="include-title" class="type-mono-label text-mute">{{ page.includeLabel }}</h2>
				<p class="type-body text-ink-soft">{{ page.includeText }}</p>
			</section>
		</div>

		<div class="flex flex-col gap-4 lg:w-[560px] lg:shrink-0">
			<ContactForm :config="data.form as ContactFormConfig" :title="page.briefTitle" :step="page.briefStep" :sent-label="page.briefSentLabel" />

			<section class="flex flex-col items-start gap-3 rounded-md border border-line bg-surface p-5 md:p-7 lg:rounded-lg" aria-labelledby="skip-form">
				<h2 id="skip-form" class="type-mono-label text-mute">{{ page.skipFormLabel }}</h2>
				<p class="type-h4 text-ink">{{ page.skipFormText }}</p>
				<UiButton v-if="calUrl && page.skipFormCta" kind="secondary" :href="calUrl" external @click="track('book-call', { from: 'contact-skip-form' })">
					<GlyphLabel :text="page.skipFormCta" new-tab />
				</UiButton>
			</section>
		</div>
	</div>
</template>
