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
	<section v-if="cta?.title" class="site-container pb-12 md:pb-16 lg:pb-30" aria-labelledby="contact-cta-title">
		<div
			class="flex flex-col gap-8 rounded-lg border border-line bg-surface px-6 pt-8 pb-7 md:px-10 md:py-12 lg:flex-row lg:items-center lg:gap-16 lg:px-16 lg:py-[72px]"
		>
			<div class="flex flex-col gap-6 lg:min-w-0 lg:flex-1">
				<h2 id="contact-cta-title" class="type-display-l-lg whitespace-pre-line">
					{{ title.plain }}<span class="text-accent">{{ title.accent }}</span>
				</h2>
				<p v-if="cta.body" class="type-body-l-lg text-ink-soft lg:max-w-[560px]">{{ cta.body }}</p>
				<div class="flex flex-col gap-3 lg:flex-row">
					<UiButton v-if="cta.primaryCta?.href" :to="href(cta.primaryCta.href)" class="max-lg:w-full">{{ cta.primaryCta.label }}</UiButton>
					<UiButton
						v-if="calUrl && cta.secondaryCtaLabel"
						kind="secondary"
						:href="calUrl"
						external
						class="max-lg:w-full"
						@click="track('book-call', { from: 'contact-cta' })"
					>
						<GlyphLabel :text="cta.secondaryCtaLabel" new-tab />
					</UiButton>
				</div>
			</div>

			<div class="flex w-full flex-col gap-2.5 border-t border-line pt-5 type-mono-s lg:w-[400px] lg:shrink-0">
				<p v-if="cta.terminalPrompt" class="flex min-h-5 gap-2 text-ink">
					<span class="text-accent" aria-hidden="true">$</span>{{ cta.terminalPrompt }}
				</p>
				<dl class="m-0 flex flex-col gap-2.5">
					<div v-for="row in cta.terminalRows ?? []" :key="row.id ?? row.key" class="flex items-start">
						<dt class="h-5 w-20 shrink-0 text-faint lg:w-22">{{ row.key }}</dt>
						<dd
							class="m-0 flex min-h-5 min-w-0 items-start gap-2 [overflow-wrap:anywhere]"
							:class="row.live || row.href ? 'text-accent' : 'text-ink-soft'"
						>
							<span v-if="row.live" class="live-dot mt-[7px]" aria-hidden="true"></span>
							<a
								v-if="row.href"
								:href="row.href"
								:target="isExternal(row.href) ? '_blank' : undefined"
								:rel="isExternal(row.href) ? 'noopener' : undefined"
								class="relative text-accent underline underline-offset-[3px] after:absolute after:inset-x-0 after:-inset-y-[5px] hover:text-accent-hover"
								@click="trackLink(row.href)"
								>{{ row.value
								}}<span v-if="isExternal(row.href) && layout?.site.newTabLabel" class="sr-only"> {{ layout.site.newTabLabel }}</span></a
							>
							<span v-else>{{ row.value }}</span>
						</dd>
					</div>
				</dl>
			</div>
		</div>
	</section>
</template>
