<script setup lang="ts">
const { heading, sub, level = 'h2' } = defineProps<{ heading: string | null | undefined; sub?: string | null; level?: 'h1' | 'h2' }>()
</script>

<template>
	<div class="flex max-w-[60ch] flex-col gap-4">
		<component :is="level" class="type-h2 whitespace-pre-line">{{ heading }}</component>
		<p v-if="sub" class="type-body-l text-ink-soft">{{ sub }}</p>
	</div>
</template>
