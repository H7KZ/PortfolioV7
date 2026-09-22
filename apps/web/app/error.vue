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
const title = computed(() => entry.value?.title ?? error.statusMessage ?? 'Error')
const message = computed(() => entry.value?.message ?? content.value?.fallbackMessage ?? error.message)

useHead(() => ({ title: `${status.value} · ${title.value}` }))
</script>

<template>
	<NuxtLayout>
		<div class="flex h-full w-full flex-col items-center justify-center gap-8 px-8 py-32 text-center">
			<h1 class="text-8xl font-semibold text-red-400">{{ status }}</h1>
			<h2 class="text-4xl font-light text-neutral-200 italic">{{ title }}</h2>
			<p class="text-neutral-400">{{ message }}</p>
			<NuxtLink :to="href('/')" class="mt-4 rounded-full border border-white px-6 py-2 text-sm transition-all hover:bg-white/10" @click="clearError()">{{
				content?.backLabel ?? '← Back'
			}}</NuxtLink>
		</div>
	</NuxtLayout>
</template>
