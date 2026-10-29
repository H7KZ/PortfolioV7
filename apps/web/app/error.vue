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
		<div class="site-container flex flex-col gap-(--block-gap) pt-10 pb-(--section-gap) md:pt-14 lg:pt-20">
			<header class="flex max-w-[840px] flex-col gap-6">
				<h1 class="type-display-l">{{ title }}</h1>
				<p class="max-w-[60ch] type-body-l text-ink-soft">{{ message }}</p>
			</header>

			<ul v-if="suggestions.length" class="flex max-w-[640px] list-none flex-col gap-3 p-0">
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
			<UiButton v-else kind="secondary" class="self-start" :href="href('/')" @click.prevent="leave(href('/'))">{{ content?.backLabel }}</UiButton>

			<p v-if="codeLabel" class="type-mono-s text-faint">{{ codeLabel }}</p>
		</div>
	</NuxtLayout>
</template>
