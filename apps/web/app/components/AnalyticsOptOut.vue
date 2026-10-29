<script setup lang="ts">
const { title, activeText, inactiveText, optOutLabel, optInLabel } = defineProps<{
	title: string
	activeText: string
	inactiveText: string
	optOutLabel: string
	optInLabel: string
}>()

const STORAGE_KEY = 'umami.disabled'
const optedOut = ref(false)
const ready = ref(false)

onMounted(() => {
	try {
		optedOut.value = localStorage.getItem(STORAGE_KEY) === '1'
	} catch {
		optedOut.value = false
	}
	ready.value = true
})

function toggle(): void {
	try {
		if (optedOut.value) localStorage.removeItem(STORAGE_KEY)
		else localStorage.setItem(STORAGE_KEY, '1')
		optedOut.value = !optedOut.value
	} catch {
		optedOut.value = false
	}
}
</script>

<template>
	<section class="flex max-w-[68ch] flex-col gap-4 rounded-lg border border-line bg-surface p-6" aria-labelledby="analytics-opt-out">
		<h2 id="analytics-opt-out" class="type-h4">{{ title }}</h2>
		<div class="flex flex-wrap items-center justify-between gap-4">
			<p class="type-body-s text-ink-soft" aria-live="polite">{{ optedOut ? inactiveText : activeText }}</p>
			<UiButton kind="secondary" size="small" :disabled="!ready" @click="toggle">{{ optedOut ? optInLabel : optOutLabel }}</UiButton>
		</div>
	</section>
</template>
