<script setup lang="ts">
const value = defineModel<string>({ required: true })
const {
	label,
	height = 8,
	placeholder,
	required,
	error
} = defineProps<{
	label?: string
	height?: number
	placeholder?: string | null
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
		<textarea
			:id="id"
			v-model="value"
			class="w-full resize-none rounded-md border-[1.5px] border-neutral-500 bg-[#ffffff03] p-2 pl-3.5 text-sm text-white placeholder:text-neutral-500"
			:style="{ height: `${height}rem` }"
			:placeholder="placeholder ?? undefined"
			:required="required"
			:aria-required="required ? 'true' : undefined"
			:aria-describedby="error ? errorId : undefined"
			@input="emit('input')"
		></textarea>
		<p :id="errorId" class="mt-0.5 h-4 text-xs text-red-400" aria-live="polite">
			{{ error }}
		</p>
	</div>
</template>
