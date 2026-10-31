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

// The slot sits in a span so label and trailing glyph stay one inline run (a space apart, as in Figma) instead of two flex items a full gap apart.
const classes = computed(() => [
	'[--glyph-gap:0.3em] type-button inline-flex shrink-0 items-center justify-center gap-2.5 rounded-sm whitespace-nowrap no-underline transition-colors duration-150 ease-(--ease) disabled:cursor-not-allowed disabled:opacity-40 aria-disabled:opacity-40',
	size === 'small' ? 'tap-target min-h-control-sm px-4 py-1.5' : 'min-h-control-lg px-[22px] py-3.5',
	block ? 'w-full' : '',
	kind === 'primary'
		? 'bg-accent text-accent-ink hover:bg-accent-hover disabled:hover:bg-accent'
		: 'border border-control text-ink hover:border-ink-soft hover:bg-surface-2 disabled:hover:border-control disabled:hover:bg-transparent'
])
const dotClass = computed(() => ['size-[7px] shrink-0 rounded-full', kind === 'primary' ? 'bg-accent-ink' : 'bg-accent'])
</script>

<template>
	<NuxtLink v-if="to" :to="to" :class="classes">
		<span v-if="dot" :class="dotClass" aria-hidden="true"></span>
		<span><slot /></span>
	</NuxtLink>
	<a v-else-if="href" :href="href" :class="classes" :target="external ? '_blank' : undefined" :rel="external ? 'noopener' : undefined">
		<span v-if="dot" :class="dotClass" aria-hidden="true"></span>
		<span><slot /></span>
	</a>
	<button v-else :type="type" :class="classes" :disabled="disabled || busy" :aria-busy="busy || undefined">
		<span v-if="dot" :class="dotClass" aria-hidden="true"></span>
		<span><slot /></span>
	</button>
</template>
