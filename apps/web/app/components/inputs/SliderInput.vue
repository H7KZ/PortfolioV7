<script setup lang="ts">
const value = defineModel<number>({ required: true })
const { min, max, step, label, minLabel, maxLabel, valueLabel, required, error } = defineProps<{
	min: number
	max: number
	step?: number
	label?: string
	minLabel?: string
	maxLabel?: string
	valueLabel?: (value: number) => string
	required?: boolean
	error?: string
}>()
const emit = defineEmits<{ input: [] }>()

const id = useId()
const errorId = `${id}-error`
</script>

<template>
	<div class="flex w-full flex-col gap-0.5">
		<label :for="id" class="text-sm font-normal text-neutral-300">
			{{ label }}
			{{ required ? '*' : '' }}
		</label>
		<input
			:id="id"
			v-model.number="value"
			type="range"
			class="my-3 h-1 w-full cursor-pointer rounded-full bg-neutral-800 accent-white outline-none"
			:min="min"
			:max="max"
			:step="step"
			:required="required"
			:aria-describedby="error ? errorId : undefined"
			@input="emit('input')"
		/>
		<div class="flex w-full justify-between">
			<p class="text-xs text-neutral-400">{{ minLabel }}</p>
			<p class="text-sm text-white">{{ valueLabel ? valueLabel(value) : value }}</p>
			<p class="text-xs text-neutral-400">{{ maxLabel }}</p>
		</div>
		<p :id="errorId" class="mt-1 h-4 text-xs text-red-400" aria-live="polite">
			{{ error }}
		</p>
	</div>
</template>
