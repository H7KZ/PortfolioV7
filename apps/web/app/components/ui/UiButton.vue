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
	'type-button inline-flex shrink-0 items-center justify-center gap-2.5 rounded-sm whitespace-nowrap no-underline transition-colors duration-150 ease-(--ease) disabled:cursor-not-allowed disabled:opacity-40 aria-disabled:opacity-40',
	size === 'small' ? 'min-h-11 px-4 py-3' : 'min-h-12 px-[22px] py-3.5',
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
		<slot />
	</NuxtLink>
	<a v-else-if="href" :href="href" :class="classes" :target="external ? '_blank' : undefined" :rel="external ? 'noopener' : undefined">
		<span v-if="dot" :class="dotClass" aria-hidden="true"></span>
		<slot />
	</a>
	<button v-else :type="type" :class="classes" :disabled="disabled || busy" :aria-busy="busy || undefined">
		<span v-if="dot" :class="dotClass" aria-hidden="true"></span>
		<slot />
	</button>
</template>
