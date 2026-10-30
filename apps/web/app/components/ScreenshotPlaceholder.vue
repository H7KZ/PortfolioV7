<script setup lang="ts">
const { kicker, label, spec, fill = false } = defineProps<{ kicker?: string | null; label?: string | null; spec?: string | null; fill?: boolean }>()
</script>

<template>
	<div
		:class="fill ? 'h-full' : 'aspect-[348/271] md:aspect-16/10'"
		class="flex w-full flex-col items-center justify-center gap-3 border-[1.5px] border-dashed border-line-strong bg-surface-2 bg-[radial-gradient(circle,rgb(255_255_255/0.05)_1px,transparent_1.5px)] bg-size-[20px_20px] bg-top-left p-6 text-center"
	>
		<svg class="h-9 w-12 shrink-0" viewBox="0 0 48 36" fill="none" aria-hidden="true">
			<rect x="0.75" y="0.75" width="46.5" height="34.5" rx="5.25" class="stroke-mute" stroke-width="1.5" />
			<circle cx="24" cy="18" r="6.25" class="stroke-accent" stroke-width="1.5" />
		</svg>
		<p v-if="kicker" class="type-mono-label text-mute">{{ kicker }}</p>
		<p class="max-w-[40ch] type-h4 text-ink">{{ label }}</p>
		<p v-if="spec" class="max-w-[52ch] type-mono-s text-mute">{{ spec }}</p>
	</div>
</template>
