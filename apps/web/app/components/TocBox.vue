<script setup lang="ts">
import type { TocItem } from '#shared/types/content'

const {
	label,
	items,
	variant = 'rail'
} = defineProps<{
	label: string
	items: TocItem[]
	/** Rail marks the current section beside the text (desktop); inline is the plain list between the intro and the body. */
	variant?: 'rail' | 'inline'
}>()

const labelId = useId()
const active = ref(items[0]?.id ?? '')

onMounted(() => {
	if (variant !== 'rail' || !items.length) return
	const headings = items.map(item => document.getElementById(item.id)).filter((node): node is HTMLElement => Boolean(node))
	const observer = new IntersectionObserver(
		entries => {
			const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
			if (visible) active.value = visible.target.id
		},
		{ rootMargin: '-96px 0px -65% 0px' }
	)
	headings.forEach(node => observer.observe(node))
	onBeforeUnmount(() => observer.disconnect())
})
</script>

<template>
	<nav
		v-if="items.length"
		:aria-labelledby="labelId"
		class="flex flex-col items-start rounded-md border border-line bg-surface"
		:class="variant === 'rail' ? 'w-[280px] gap-3 p-5' : 'gap-2 p-[18px]'"
	>
		<p :id="labelId" class="type-mono-label text-mute">{{ label }}</p>
		<a
			v-for="item in items"
			:key="item.id"
			:href="`#${item.id}`"
			:aria-current="variant === 'rail' && active === item.id ? 'location' : undefined"
			class="no-underline transition-colors duration-150 ease-(--ease)"
			:class="
				variant === 'rail'
					? [
							'relative flex w-full items-center gap-2.5 type-body-s before:h-4 before:w-0.5 before:shrink-0 before:content-[\'\']',
							active === item.id ? 'text-ink before:bg-accent' : 'text-mute before:bg-line-strong hover:text-ink'
						]
					: 'type-body-s text-ink-soft hover:text-ink'
			"
			>{{ item.text }}</a
		>
	</nav>
</template>
