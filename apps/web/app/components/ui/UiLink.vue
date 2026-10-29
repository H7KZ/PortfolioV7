<script setup lang="ts">
const { to, current = false } = defineProps<{ to: string; current?: boolean }>()
</script>

<template>
	<NuxtLink
		:to="to"
		:aria-current="current ? 'page' : undefined"
		class="inline-flex min-h-11 flex-col items-center justify-center gap-1.5 rounded-[4px] type-button no-underline decoration-1 underline-offset-4 transition-colors duration-150 ease-(--ease) hover:text-ink hover:underline"
		:class="current ? 'text-ink' : 'text-ink-soft'"
	>
		<span><slot /></span>
		<span v-if="current" class="h-0.5 w-4 bg-accent" aria-hidden="true"></span>
	</NuxtLink>
</template>
