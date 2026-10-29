<script setup lang="ts">
const { tone = 'neutral' } = defineProps<{ tone?: 'live' | 'neutral' }>()
</script>

<template>
	<span class="inline-flex items-center gap-2 type-mono-label" :class="tone === 'live' ? 'text-accent' : 'text-mute'">
		<span v-if="tone === 'live'" class="live-dot" aria-hidden="true"></span>
		<slot />
	</span>
</template>
