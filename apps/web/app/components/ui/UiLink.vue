<script setup lang="ts">
const { to, current } = defineProps<{ to: string; current?: boolean | 'page' | 'true' }>()
const ariaCurrent = computed(() => (current === true ? 'page' : current || undefined))
</script>

<template>
	<NuxtLink
		:to="to"
		:aria-current="ariaCurrent"
		class="tap-target inline-flex min-h-control-sm items-center justify-center rounded-[4px] type-button no-underline decoration-1 underline-offset-4 transition-colors duration-150 ease-(--ease)"
		:class="current ? 'text-ink' : 'text-ink-soft hover:text-ink hover:underline'"
	>
		<!-- The bar hangs below the label instead of stacking with it, so the label keeps one baseline across the links. -->
		<span class="relative"
			><slot /><span v-if="current" class="absolute top-full left-1/2 mt-0.5 h-0.5 w-4 -translate-x-1/2 bg-accent" aria-hidden="true"></span
		></span>
	</NuxtLink>
</template>
