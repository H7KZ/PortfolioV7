<script setup lang="ts">
import type { NuxtError } from '#app'

import type { ErrorsData } from '#shared/types/content'

const { error } = defineProps<{ error: NuxtError }>()

const locale = useLocaleCode()
const href = useHref()
const { data: content } = await useFetch<ErrorsData>('/api/content/errors', {
	key: computed(() => `content:errors:${locale.value}`),
	query: { locale }
})

const status = computed(() => error.statusCode ?? 500)
const entry = computed(() => content.value?.messages?.find(message => message.status === status.value))
const title = computed(() => entry.value?.title ?? error.statusMessage ?? String(status.value))
const message = computed(() => entry.value?.message ?? content.value?.fallbackMessage ?? error.message)
const suggestions = computed(() => (status.value === 404 ? (content.value?.suggestions ?? []) : []))
const codeLabel = computed(() => content.value?.codeLabel?.replace('{status}', String(status.value)))

/** The error replaces the page without a route change, so leaving it has to clear it. */
function leave(target: string): void {
	clearError({ redirect: target })
}

useHead(() => ({ title: title.value, meta: [{ key: 'robots', name: 'robots', content: 'noindex' }] }))
</script>

<template>
	<NuxtLayout :contact-cta="false">
		<div class="site-container flex flex-col items-start gap-6 pt-16 pb-[72px] md:pt-24 md:pb-24 lg:pt-30 lg:pb-36">
			<h1 class="type-display-l-lg">{{ title }}</h1>
			<p class="max-w-[640px] type-body-l-lg text-ink-soft">{{ message }}</p>

			<ul v-if="suggestions.length" class="flex w-full max-w-[592px] list-none flex-col gap-2.5 p-0 lg:gap-3">
				<li v-for="suggestion in suggestions" :key="suggestion.id ?? suggestion.href">
					<ChannelRow
						:icon="suggestion.icon"
						:label="suggestion.label"
						:sub="suggestion.sub"
						:href="href(suggestion.href)"
						@click.prevent="leave(href(suggestion.href))"
					/>
				</li>
			</ul>
			<UiButton v-else kind="secondary" :href="href('/')" @click.prevent="leave(href('/'))">{{ content?.backLabel }}</UiButton>

			<p v-if="codeLabel" class="type-mono-s text-faint">{{ codeLabel }}</p>
		</div>
	</NuxtLayout>
</template>
