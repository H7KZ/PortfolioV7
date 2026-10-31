<script setup lang="ts">
const { tone = 'neutral' } = defineProps<{ tone?: 'live' | 'neutral' }>()
</script>

<template>
	<span
		class="inline-flex items-center gap-[7px] rounded-full py-[5px] pr-2.5 pl-[9px] type-mono-label"
		:class="tone === 'live' ? 'bg-accent-soft text-accent' : 'border border-line bg-surface-2 text-mute'"
	>
		<span class="size-1.5 shrink-0 rounded-full" :class="tone === 'live' ? 'bg-accent' : 'bg-faint'" aria-hidden="true"></span>
		<slot />
	</span>
</template>
