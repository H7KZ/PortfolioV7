<script setup lang="ts">
import TablerChevronDown from '~icons/tabler/chevron-down'

const model = defineModel<string>({ required: true })
const { id, label, emptyOption, options, error } = defineProps<{
	id: string
	label: string
	emptyOption: string
	options: { key: string; label: string }[]
	error?: string | null
}>()
</script>

<template>
	<div class="flex flex-col gap-2">
		<label :for="id" class="type-body-s font-medium text-ink">{{ label }}</label>
		<div class="relative">
			<select
				:id="id"
				v-model="model"
				:name="id"
				:aria-invalid="error ? 'true' : undefined"
				:aria-describedby="error ? `${id}-error` : undefined"
				class="block min-h-12 w-full appearance-none rounded-md border bg-surface-2 py-0 pr-10 pl-4 type-body text-ink transition-[border-color,box-shadow] duration-150 ease-(--ease)"
				:class="
					error
						? 'border-danger shadow-[0_0_0_1px_var(--color-danger)]'
						: 'border-control hover:border-ink-soft focus:border-accent focus:shadow-[0_0_0_1px_var(--color-accent)]'
				"
			>
				<option value="">{{ emptyOption }}</option>
				<option v-for="option in options" :key="option.key" :value="option.key">{{ option.label }}</option>
			</select>
			<TablerChevronDown class="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
		</div>
		<p v-if="error" :id="`${id}-error`" class="flex gap-2 type-body-s text-danger">
			<span aria-hidden="true" class="font-mono font-medium">!</span>{{ error }}
		</p>
	</div>
</template>
