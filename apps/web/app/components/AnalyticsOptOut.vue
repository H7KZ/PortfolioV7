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
	<section
		class="flex flex-col gap-4 rounded-md border border-line bg-surface px-5 py-[22px] sm:flex-row sm:items-center lg:px-6"
		aria-labelledby="analytics-opt-out"
	>
		<div class="flex min-w-0 flex-1 flex-col gap-1">
			<h2 id="analytics-opt-out" class="type-mono-label text-mute">{{ title }}</h2>
			<p class="type-body text-ink" aria-live="polite">{{ optedOut ? inactiveText : activeText }}</p>
		</div>
		<UiButton kind="secondary" :disabled="!ready" class="self-start sm:self-auto" @click="toggle">{{ optedOut ? optInLabel : optOutLabel }}</UiButton>
	</section>
</template>
