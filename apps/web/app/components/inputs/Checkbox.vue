<script setup lang="ts">
const { id, checked, label, required, disabled, error } = defineProps<{
	id?: string
	checked: boolean
	label?: string
	required?: boolean
	disabled?: boolean
	error?: string
}>()
const emit = defineEmits<{ change: [] }>()

const fallbackId = useId()
const inputId = computed(() => id ?? fallbackId)
</script>

<template>
	<div class="flex w-full flex-col gap-0.5">
		<div class="flex items-center gap-2.5">
			<div class="relative flex items-center">
				<input
					:id="inputId"
					type="checkbox"
					class="peer h-4.5 w-4.5 cursor-pointer appearance-none rounded border-[1.5px] border-neutral-500 bg-transparent checked:border-white checked:bg-white"
					:checked="checked"
					:disabled="disabled"
					@change="!disabled && emit('change')"
				/>
				<svg
					class="pointer-events-none absolute top-0.5 left-0.5 hidden h-3.5 w-3.5 peer-checked:block"
					viewBox="0 0 24 24"
					fill="none"
					stroke="black"
					stroke-width="3"
				>
					<path d="M20 6L9 17l-5-5" />
				</svg>
			</div>

			<label
				:for="inputId"
				class="flex cursor-pointer flex-col truncate text-base font-normal text-neutral-300"
				:class="disabled ? 'text-neutral-500' : ''"
			>
				<template v-if="label">
					{{ label }}
					{{ required ? '*' : '' }}
				</template>
			</label>
		</div>

		<p v-if="error" class="mt-0.5 h-4 text-xs text-red-400">
			{{ error }}
		</p>
	</div>
</template>
