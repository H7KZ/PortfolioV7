<script setup lang="ts">
const { to, current = false } = defineProps<{ to: string; current?: boolean }>()
</script>

<template>
	<NuxtLink
		:to="to"
		:aria-current="current ? 'page' : undefined"
		class="relative inline-flex min-h-11 items-center type-button no-underline decoration-1 underline-offset-4 transition-colors duration-150 ease-(--ease) hover:text-ink hover:underline"
		:class="current ? 'text-ink after:absolute after:bottom-1 after:left-0 after:h-0.5 after:w-4 after:bg-accent' : 'text-ink-soft'"
	>
		<slot />
	</NuxtLink>
</template>
