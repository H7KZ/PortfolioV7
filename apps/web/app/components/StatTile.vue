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
	<div class="flex flex-col gap-2.5 rounded-md border border-line bg-surface p-6">
		<dt class="flex items-center gap-2 type-mono-label text-mute">
			<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-line-strong" aria-hidden="true"></span>{{ label }}
		</dt>
		<dd
			class="m-0"
			:class="
				variant === 'text'
					? 'font-sans text-[22px] leading-[1.22] font-medium tracking-[-0.4px] text-ink'
					: variant === 'accent'
						? 'font-sans text-[22px] leading-[1.22] font-medium tracking-[-0.4px] text-accent'
						: 'type-stat text-ink'
			"
		>
			{{ value }}
		</dd>
		<dd v-if="sub" class="m-0 type-body-s text-mute">{{ sub }}</dd>
	</div>
</template>
