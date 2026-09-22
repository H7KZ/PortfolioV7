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
	<div class="mt-12 rounded-(--radius) border border-(--line) bg-(--bg-2) px-6 py-5">
		<div class="mono mb-1 text-[10px] tracking-widest text-(--accent) uppercase">◆ {{ title }}</div>
		<div class="flex flex-wrap items-center justify-between gap-4">
			<p class="m-0 text-[13px] leading-[1.55] text-(--fg-3)" aria-live="polite">{{ optedOut ? inactiveText : activeText }}</p>
			<button
				type="button"
				:disabled="!ready"
				class="mono cursor-pointer rounded-md border border-(--line-2) px-3.5 py-2 text-[11px] tracking-wide text-(--fg-3) transition-colors duration-150 hover:border-(--fg-4) hover:text-(--fg) disabled:opacity-50"
				@click="toggle"
			>
				{{ optedOut ? optInLabel : optOutLabel }}
			</button>
		</div>
	</div>
</template>
