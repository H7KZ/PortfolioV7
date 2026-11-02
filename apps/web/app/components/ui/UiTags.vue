<script setup lang="ts">
const { tags } = defineProps<{ tags: (string | null | undefined)[] | null | undefined }>()
</script>

<template>
	<ul v-if="tags?.length" class="flex list-none flex-wrap gap-1.5 p-0">
		<li v-for="tag in tags" :key="tag ?? ''">
			<UiTag>{{ tag }}</UiTag>
		</li>
	</ul>
</template>
