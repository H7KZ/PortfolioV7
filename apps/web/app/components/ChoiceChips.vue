<script setup lang="ts">
const model = defineModel<string>({ required: true })
const { name, options, labelledBy } = defineProps<{
	name: string
	options: { key: string; label: string }[]
	labelledBy: string
}>()

/** The field is optional: clicking the selected chip again clears it. Arrow keys also fire click, with the new key. */
function select(key: string): void {
	model.value = model.value === key ? '' : key
}
</script>

<template>
	<div role="radiogroup" :aria-labelledby="labelledBy" class="flex flex-wrap gap-2">
		<label
			v-for="option in options"
			:key="option.key"
			class="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 type-button transition-colors duration-150 ease-(--ease) has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
			:class="model === option.key ? 'border-accent bg-accent-soft text-ink' : 'border-control text-ink-soft hover:border-ink-soft hover:text-ink'"
		>
			<input type="radio" class="sr-only" :name="name" :value="option.key" :checked="model === option.key" @click="select(option.key)" />
			<span v-if="model === option.key" aria-hidden="true" class="text-accent">✓</span>
			{{ option.label }}
		</label>
	</div>
</template>
