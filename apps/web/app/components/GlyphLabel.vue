<script setup lang="ts">
const { text, newTab = false } = defineProps<{ text: string | null | undefined; newTab?: boolean }>()

const parts = computed(() => splitGlyphs(text))
const { newTabLabel } = useSiteText()
</script>

<template>
	<span v-if="parts.before" aria-hidden="true" class="mr-[0.4em]">{{ parts.before.trim() }}</span
	>{{ parts.text }}<span v-if="parts.after" aria-hidden="true" class="ml-(--glyph-gap,8px)">{{ parts.after.trim() }}</span
	><span v-if="newTab && newTabLabel" class="sr-only"> {{ newTabLabel }}</span>
</template>
