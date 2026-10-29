<script setup lang="ts">
const {
	kind = 'primary',
	to,
	href,
	type = 'button',
	external = false,
	disabled = false,
	busy = false,
	dot = false,
	block = false,
	size = 'default'
} = defineProps<{
	kind?: 'primary' | 'secondary'
	to?: string
	href?: string
	type?: 'button' | 'submit'
	external?: boolean
	disabled?: boolean
	busy?: boolean
	dot?: boolean
	block?: boolean
	size?: 'default' | 'small'
}>()

const classes = computed(() => [
	'type-button inline-flex shrink-0 items-center justify-center gap-2.5 rounded-md px-5 whitespace-nowrap no-underline transition-colors duration-150 ease-(--ease) disabled:cursor-not-allowed disabled:opacity-50',
	size === 'small' ? 'min-h-11 px-3 sm:px-4' : 'min-h-11 md:min-h-12',
	block ? 'w-full' : '',
	kind === 'primary'
		? 'bg-accent text-accent-ink hover:bg-accent-hover'
		: 'border border-control text-ink hover:border-ink-soft hover:bg-surface-2 aria-disabled:hover:bg-transparent'
])
</script>

<template>
	<NuxtLink v-if="to" :to="to" :class="classes">
		<span v-if="dot" class="live-dot" aria-hidden="true"></span>
		<slot />
	</NuxtLink>
	<a v-else-if="href" :href="href" :class="classes" :target="external ? '_blank' : undefined" :rel="external ? 'noopener' : undefined">
		<span v-if="dot" class="live-dot" aria-hidden="true"></span>
		<slot />
	</a>
	<button v-else :type="type" :class="classes" :disabled="disabled || busy" :aria-busy="busy || undefined">
		<span v-if="dot" class="live-dot" aria-hidden="true"></span>
		<slot />
	</button>
</template>
