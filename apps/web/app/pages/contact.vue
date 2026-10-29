<script setup lang="ts">
import type { ContactFormConfig } from '@portfolio/content/contact-form'
import TablerCalendar from '~icons/tabler/calendar'

import type { ContactData } from '#shared/types/content'

definePageMeta({ contactCta: false })

const data = await useContent<ContactData>('contact')
const { data: layout } = useLayoutContent()
const { calUrl } = useSiteText()
const { track, trackLink } = useAnalytics()

const page = computed(() => data.value.page)
const site = computed(() => layout.value?.site)

useSeo(() => ({
	title: page.value.meta?.title ?? page.value.heading.replace(/\n/g, ' '),
	description: page.value.meta?.description ?? page.value.intro,
	image: page.value.meta?.image,
	type: 'website'
}))
</script>

<template>
	<div class="site-container grid gap-10 pt-10 pb-(--section-gap) md:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,640px)] lg:gap-16 lg:pt-20">
		<div class="flex flex-col gap-8">
			<div class="flex flex-col gap-6">
				<p class="type-mono-s text-mute"><span class="text-accent" aria-hidden="true">$ </span>{{ page.label }}</p>
				<h1 class="type-display-l whitespace-pre-line">{{ page.heading }}</h1>
				<p class="max-w-[52ch] type-body-l text-ink-soft">{{ page.intro }}</p>
			</div>

			<ul class="flex list-none flex-col gap-3 p-0">
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
						<template #icon><TablerCalendar class="h-4 w-4" /></template>
					</ChannelRow>
				</li>
			</ul>

			<div class="flex flex-col gap-3 rounded-lg border border-dashed border-line-strong p-6 max-lg:hidden">
				<h2 class="type-h4">{{ page.includeLabel }}</h2>
				<p class="type-body-s text-ink-soft">{{ page.includeText }}</p>
			</div>
		</div>

		<div class="flex flex-col gap-6">
			<ContactForm :config="data.form as ContactFormConfig" :title="page.briefTitle" :step="page.briefStep" :sent-label="page.briefSentLabel" />

			<section class="flex flex-col items-start gap-4 rounded-lg border border-line bg-surface p-6" aria-labelledby="skip-form">
				<h2 id="skip-form" class="type-h4">{{ page.skipFormLabel }}</h2>
				<p class="type-body-s text-ink-soft">{{ page.skipFormText }}</p>
				<UiButton v-if="calUrl && page.skipFormCta" kind="secondary" :href="calUrl" external @click="track('book-call', { from: 'contact-skip-form' })">
					<GlyphLabel :text="page.skipFormCta" new-tab />
				</UiButton>
			</section>
		</div>
	</div>
</template>
