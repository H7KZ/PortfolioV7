<script setup lang="ts">
const { heading, sub, level = 'h2' } = defineProps<{ heading: string | null | undefined; sub?: string | null; level?: 'h1' | 'h2' }>()
</script>

<template>
	<div class="flex flex-col gap-3 border-b border-line pb-7 lg:gap-4 lg:pb-10">
		<component
			:is="level"
			class="max-w-[760px] font-sans text-[26px] leading-[1.12] font-bold tracking-[-0.7px] text-wrap whitespace-pre-line text-ink lg:text-[36px] lg:leading-[1.08] lg:tracking-[-1.1px]"
			>{{ heading }}</component
		>
		<p v-if="sub" class="max-w-[640px] font-sans text-[17px] leading-[1.52] text-wrap text-ink-soft lg:text-[18px]">{{ sub }}</p>
	</div>
</template>
