<script setup lang="ts">
const { heading, sub, level = 'h2', id } = defineProps<{ heading: string | null | undefined; sub?: string | null; level?: 'h1' | 'h2'; id?: string }>()
</script>

<template>
	<div class="flex flex-col gap-3 border-b border-line pb-7 lg:gap-4 lg:pb-10">
		<component :is="level" :id="id" class="max-w-[760px] type-h2-section whitespace-pre-line text-ink">{{ heading }}</component>
		<p v-if="sub" class="max-w-[640px] font-sans text-[17px] leading-[26px] text-ink-soft lg:text-[18px] lg:leading-[27px]">{{ sub }}</p>
	</div>
</template>
