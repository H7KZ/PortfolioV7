<script setup lang="ts">
const model = defineModel<string>({ required: true })
const {
	id,
	label,
	type = 'text',
	placeholder,
	error,
	required = false,
	disabled = false,
	autocomplete,
	multiline = false,
	rows = 6,
	maxlength
} = defineProps<{
	id: string
	label: string
	type?: 'text' | 'email' | 'date'
	placeholder?: string | null
	error?: string | null
	required?: boolean
	disabled?: boolean
	autocomplete?: string
	multiline?: boolean
	rows?: number
	maxlength?: number
}>()
const emit = defineEmits<{ blur: [] }>()

const errorId = computed(() => `${id}-error`)
const control = computed(() => [
	'type-body block w-full rounded-md border bg-surface-2 px-4 text-ink transition-[border-color,box-shadow] duration-150 ease-(--ease) placeholder:text-faint disabled:cursor-not-allowed disabled:opacity-50',
	error
		? 'border-danger shadow-[0_0_0_1px_var(--color-danger)]'
		: 'border-control hover:border-ink-soft focus:border-accent focus:shadow-[0_0_0_1px_var(--color-accent)]',
	multiline ? 'min-h-36 resize-y py-3' : 'min-h-12'
])
</script>

<template>
	<div class="flex flex-col gap-2">
		<label :for="id" class="type-body-s font-medium text-ink">{{ label }}</label>
		<textarea
			v-if="multiline"
			:id="id"
			v-model="model"
			:name="id"
			:rows="rows"
			:placeholder="placeholder ?? undefined"
			:required="required"
			:disabled="disabled"
			:maxlength="maxlength"
			:aria-invalid="error ? 'true' : undefined"
			:aria-describedby="error ? errorId : undefined"
			:class="control"
			@blur="emit('blur')"
		></textarea>
		<input
			v-else
			:id="id"
			v-model="model"
			:name="id"
			:type="type"
			:placeholder="placeholder ?? undefined"
			:required="required"
			:disabled="disabled"
			:autocomplete="autocomplete"
			:maxlength="maxlength"
			:aria-invalid="error ? 'true' : undefined"
			:aria-describedby="error ? errorId : undefined"
			:class="control"
			@blur="emit('blur')"
		/>
		<p v-if="error" :id="errorId" class="flex gap-2 type-body-s text-danger">
			<span aria-hidden="true" class="font-mono font-medium">!</span>
			<span>{{ error }}</span>
		</p>
	</div>
</template>
