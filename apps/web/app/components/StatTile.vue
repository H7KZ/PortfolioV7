<script setup lang="ts">
const {
	label,
	value,
	sub,
	variant = 'number'
} = defineProps<{
	label: string
	value: string
	sub?: string | null
	variant?: 'number' | 'text' | 'accent' | null
}>()
</script>

<template>
	<div class="flex flex-col gap-3 rounded-lg border border-line bg-surface p-6">
		<dt class="type-mono-label text-mute">{{ label }}</dt>
		<dd class="m-0" :class="variant === 'text' ? 'type-mono-m text-ink' : variant === 'accent' ? 'type-mono-m text-accent' : 'type-stat text-ink'">
			{{ value }}
		</dd>
		<dd v-if="sub" class="m-0 type-body-s text-mute">{{ sub }}</dd>
	</div>
</template>
