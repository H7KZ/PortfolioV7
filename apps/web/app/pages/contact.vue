<script setup lang="ts">
import type { ContactFormConfig } from '@portfolio/content/contact-form'

import type { ContactData } from '#shared/types/content'

const data = await useContent<ContactData>('contact')
const { data: layout } = useLayoutContent()
const { trackLink } = useAnalytics()

const page = computed(() => data.value.page)
const site = computed(() => layout.value?.site)

useSeo(() => ({
	title: page.value.meta?.title ?? page.value.heading,
	description: page.value.meta?.description,
	image: page.value.meta?.image,
	type: 'website'
}))
</script>

<template>
	<div
		class="mx-auto grid max-w-(--max) grid-cols-2 gap-16 px-8 pt-10 pb-30 max-[900px]:grid-cols-1 max-[900px]:gap-12 max-[900px]:px-5 max-[900px]:pt-7 max-[900px]:pb-20"
	>
		<!-- LEFT COL -->
		<div class="max-[900px]:static min-[900px]:sticky min-[900px]:top-8 min-[900px]:self-start">
			<div class="mono mb-3.5 text-[11px] tracking-widest text-(--fg-4) uppercase">{{ page.label }}</div>
			<h1 class="serif mt-0 mb-5 text-[clamp(32px,5vw,56px)] leading-none tracking-[-0.025em]">{{ page.heading }}</h1>
			<p class="m-0 max-w-115 text-[17px] leading-[1.55] text-(--fg-2)">{{ page.intro }}</p>

			<div class="mt-9 flex flex-col gap-2.5">
				<a
					v-if="site"
					:href="`mailto:${site.email}`"
					class="group grid grid-cols-[auto_1fr_auto] items-center gap-4.5 rounded-(--radius) border border-(--line) bg-(--bg-2) px-5.5 py-4.5 text-(--fg) no-underline transition-[border-color,transform] duration-200 hover:translate-x-1 hover:border-(--fg-5)"
					@click="trackLink('mailto:')"
				>
					<div class="mono grid h-9 w-9 place-items-center rounded-lg border border-(--line) bg-(--bg-3) text-[12px] text-(--fg-3)">@</div>
					<div class="flex flex-col gap-0.5">
						<span class="text-[14px] font-medium">{{ page.emailLabel }}</span>
						<span class="mono text-[11px] text-(--fg-4)">{{ site.email }}</span>
					</div>
					<div class="text-(--fg-4) transition-colors duration-200 group-hover:text-(--accent)">→</div>
				</a>
				<a
					v-if="site"
					:href="site.linkedinUrl"
					target="_blank"
					rel="noopener noreferrer"
					class="group grid grid-cols-[auto_1fr_auto] items-center gap-4.5 rounded-(--radius) border border-(--line) bg-(--bg-2) px-5.5 py-4.5 text-(--fg) no-underline transition-[border-color,transform] duration-200 hover:translate-x-1 hover:border-(--fg-5)"
					@click="trackLink(site.linkedinUrl)"
				>
					<div class="mono grid h-9 w-9 place-items-center rounded-lg border border-(--line) bg-(--bg-3) text-[12px] text-(--fg-3)">in</div>
					<div class="flex flex-col gap-0.5">
						<span class="text-[14px] font-medium">{{ page.linkedinLabel }}</span>
						<span class="mono text-[11px] text-(--fg-4)">{{ page.linkedinSub }}</span>
					</div>
					<div class="text-(--fg-4) transition-colors duration-200 group-hover:text-(--accent)">→</div>
				</a>
				<a
					href="#calendar"
					class="group grid grid-cols-[auto_1fr_auto] items-center gap-4.5 rounded-(--radius) border border-(--line) bg-(--bg-2) px-5.5 py-4.5 text-(--fg) no-underline transition-[border-color,transform] duration-200 hover:translate-x-1 hover:border-(--fg-5)"
				>
					<div class="mono grid h-9 w-9 place-items-center rounded-lg border border-(--line) bg-(--bg-3) text-[12px] text-(--fg-3)">📅</div>
					<div class="flex flex-col gap-0.5">
						<span class="text-[14px] font-medium">{{ page.bookCallLabel }}</span>
						<span class="mono text-[11px] text-(--fg-4)">{{ page.bookCallSub }}</span>
					</div>
					<div class="text-(--fg-4) transition-colors duration-200 group-hover:text-(--accent)">→</div>
				</a>
			</div>

			<div class="mt-10 rounded-(--radius) border border-dashed border-(--line-2) px-5.5 py-4.5 text-[13px] leading-[1.6] text-(--fg-3)">
				<div class="mono mb-3.5 text-[11px] tracking-widest text-(--accent) uppercase">{{ page.includeLabel }}</div>
				<p class="m-0">{{ page.includeText }}</p>
			</div>
		</div>

		<!-- RIGHT COL -->
		<div>
			<div class="mb-5 rounded-lg border border-(--line) bg-(--bg-2) p-7">
				<div class="mb-6 flex items-end justify-between border-b border-(--line) pb-4.5">
					<h3 class="serif m-0 text-[20px] font-normal">{{ page.briefTitle }}</h3>
					<div class="mono text-[11px] tracking-widest text-(--fg-4) uppercase">{{ page.briefStep }}</div>
				</div>
				<ContactForm :config="data.form as ContactFormConfig" :email="site?.email ?? ''" />
			</div>

			<div id="calendar" class="rounded-lg border border-(--line) bg-(--bg-2) p-7">
				<div class="mono mb-3.5 text-[11px] tracking-widest text-(--fg-4) uppercase">{{ page.skipFormLabel }}</div>
				<p class="mt-0 mb-5 text-[14px] leading-[1.55] text-(--fg-2)">{{ page.skipFormText }}</p>
				<CalendarCallPicker v-if="site" :cal-link="site.calLink" />
			</div>
		</div>
	</div>
</template>
