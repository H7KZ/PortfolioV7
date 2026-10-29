<script setup lang="ts">
import TablerCamera from '~icons/tabler/camera'

const { kicker, label, spec, fill = false } = defineProps<{ kicker?: string | null; label?: string | null; spec?: string | null; fill?: boolean }>()
</script>

<template>
	<div
		:class="fill ? 'h-full' : 'aspect-16/10'"
		class="flex w-full flex-col items-center justify-center gap-3 border border-dashed border-control bg-surface p-6 text-center"
	>
		<TablerCamera class="h-6 w-6 text-mute" aria-hidden="true" />
		<p v-if="kicker" class="type-mono-label text-mute">{{ kicker }}</p>
		<p class="max-w-[40ch] type-body-medium text-ink">{{ label }}</p>
		<p v-if="spec" class="type-mono-s text-mute">{{ spec }}</p>
	</div>
</template>
