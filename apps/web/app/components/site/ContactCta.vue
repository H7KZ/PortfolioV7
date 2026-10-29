<script setup lang="ts">
const { data: layout } = useLayoutContent()
const href = useHref()
const { calUrl } = useSiteText()
const { track, trackLink } = useAnalytics()

const cta = computed(() => layout.value?.footer.cta)

/** The accent words are the end of the title, so the title splits into a plain part and a tinted part. */
const title = computed(() => {
	const text = cta.value?.title ?? ''
	const accent = cta.value?.titleAccent ?? ''
	return accent && text.endsWith(accent) ? { plain: text.slice(0, -accent.length), accent } : { plain: text, accent: '' }
})
</script>

<template>
	<section v-if="cta?.title" class="site-container pb-(--section-gap)" aria-labelledby="contact-cta-title">
		<div class="grid gap-10 rounded-lg border border-line bg-surface p-6 md:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-16 lg:p-12">
			<div class="flex flex-col gap-6">
				<h2 id="contact-cta-title" class="type-h2 whitespace-pre-line">
					{{ title.plain }}<span class="text-accent">{{ title.accent }}</span>
				</h2>
				<p v-if="cta.body" class="max-w-[52ch] type-body-l text-ink-soft">{{ cta.body }}</p>
				<div class="flex flex-wrap gap-3">
					<UiButton v-if="cta.primaryCta?.href" :to="href(cta.primaryCta.href)">{{ cta.primaryCta.label }}</UiButton>
					<UiButton
						v-if="calUrl && cta.secondaryCtaLabel"
						kind="secondary"
						:href="calUrl"
						external
						@click="track('book-call', { from: 'contact-cta' })"
					>
						<GlyphLabel :text="cta.secondaryCtaLabel" new-tab />
					</UiButton>
				</div>
			</div>

			<div class="self-start rounded-md border border-line bg-bg p-4 sm:p-5 md:p-6">
				<p v-if="cta.terminalPrompt" class="mb-4 type-mono-s text-ink">
					<span class="text-accent" aria-hidden="true">$ </span>{{ cta.terminalPrompt }}
				</p>
				<!-- Rows are 44px tall so the links in them are comfortable tap targets; narrow phones stack key over value. -->
				<dl class="grid grid-cols-1 gap-x-6 type-mono-s min-[420px]:grid-cols-[auto_minmax(0,1fr)]">
					<template v-for="row in cta.terminalRows ?? []" :key="row.id ?? row.key">
						<dt class="flex items-end text-faint min-[420px]:min-h-11 min-[420px]:items-center">{{ row.key }}</dt>
						<dd class="m-0 flex min-h-11 min-w-0 items-center gap-2 break-words text-ink-soft">
							<span v-if="row.live" class="live-dot" aria-hidden="true"></span>
							<a
								v-if="row.href"
								:href="row.href"
								:target="isExternal(row.href) ? '_blank' : undefined"
								:rel="isExternal(row.href) ? 'noopener' : undefined"
								class="inline-flex min-h-11 items-center text-ink-soft underline decoration-control underline-offset-4 hover:text-ink hover:decoration-ink"
								@click="trackLink(row.href)"
								>{{ row.value
								}}<span v-if="isExternal(row.href) && layout?.site.newTabLabel" class="sr-only"> {{ layout.site.newTabLabel }}</span></a
							>
							<span v-else>{{ row.value }}</span>
						</dd>
					</template>
				</dl>
			</div>
		</div>
	</section>
</template>
