<script setup lang="ts">
const { headingSize = 'text-[clamp(24px,3.5vw,44px)]' } = defineProps<{
	label: string
	heading: string
	sub?: string | null
	headingSize?: string
}>()
</script>

<template>
	<div class="mb-10 grid grid-cols-[1fr_2fr] gap-10 border-b border-(--line) pb-5 max-md:grid-cols-1 max-md:gap-3">
		<div class="mono pt-3 text-[11px] tracking-[0.12em] text-(--fg-4) uppercase">◆ {{ label }}</div>
		<div>
			<h2 class="serif m-0 leading-[1.05] tracking-[-0.02em]" :class="headingSize">{{ heading }}</h2>
			<p v-if="sub" class="mt-3.5 mb-0 max-w-130 text-[15px] text-(--fg-3)">{{ sub }}</p>
		</div>
	</div>
</template>
