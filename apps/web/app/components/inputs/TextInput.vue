<script setup lang="ts">
const value = defineModel<string>({ required: true })
const {
	type = 'text',
	label,
	autocomplete,
	placeholder,
	required,
	error
} = defineProps<{
	type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url'
	label?: string
	autocomplete?: string
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
		<div class="relative w-full">
			<input
				:id="id"
				v-model="value"
				:type="type"
				class="h-10 w-full rounded-md border-[1.5px] border-neutral-500 bg-[#ffffff03] p-2 pl-3.5 text-base text-white placeholder:text-neutral-500"
				:autocomplete="autocomplete"
				:placeholder="placeholder ?? undefined"
				:required="required"
				:aria-required="required ? 'true' : undefined"
				:aria-describedby="error ? errorId : undefined"
				@input="emit('input')"
			/>
		</div>
		<p :id="errorId" class="mt-0.5 h-4 text-xs text-red-400" aria-live="polite">
			{{ error }}
		</p>
	</div>
</template>
