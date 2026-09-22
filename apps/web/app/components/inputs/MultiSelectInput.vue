<script setup lang="ts">
import IconamoonArrowUp from '~icons/iconamoon/arrow-up-2'

import Checkbox from './Checkbox.vue'

interface Option {
	value: string
	label: string
}

const value = defineModel<string[]>({ required: true })
const { options, height, label, required, error, placeholder } = defineProps<{
	options: Option[]
	height?: number
	label?: string
	required?: boolean
	error?: string
	placeholder?: string | null
}>()
const emit = defineEmits<{ input: [] }>()

const id = useId()
const errorId = `${id}-error`
const root = useTemplateRef<HTMLDivElement>('root')
const isOpened = ref(false)

useClickOutside(root, () => (isOpened.value = false))

const displayLabel = computed(() =>
	value.value.length > 0 ? value.value.map(key => options.find(option => option.value === key)?.label).join(', ') : placeholder
)

function onSelect(optionValue: string): void {
	value.value = value.value.includes(optionValue) ? value.value.filter(key => key !== optionValue) : [...value.value, optionValue]
	emit('input')
}
</script>

<template>
	<div ref="root" class="flex w-full flex-col gap-0.5">
		<label :for="id" class="text-sm font-normal text-neutral-300">
			{{ label }}
			{{ required ? '*' : '' }}
		</label>
		<div class="relative w-full">
			<div
				:id="id"
				role="button"
				tabindex="0"
				class="flex h-10 w-full cursor-pointer items-center justify-between overflow-hidden rounded-md border-[1.5px] border-neutral-500 bg-[#ffffff03] p-2 px-3 text-xs"
				:class="value.length === 0 ? '!text-base text-neutral-500' : ''"
				@click="isOpened = !isOpened"
				@keydown.enter="isOpened = !isOpened"
			>
				<p>
					{{ displayLabel }}
				</p>
				<IconamoonArrowUp class="h-7 w-7 shrink-0 text-neutral-400 transition-all" :class="isOpened ? 'rotate-180' : ''" />
			</div>

			<div
				v-if="isOpened"
				class="absolute z-50 mt-1 w-full overflow-x-hidden rounded-md border-[1.5px] border-neutral-500 bg-neutral-900"
				:style="{ maxHeight: `${height}rem`, overflowY: 'auto' }"
			>
				<div
					v-for="option in options"
					:key="option.value"
					role="checkbox"
					tabindex="0"
					:aria-checked="value.includes(option.value)"
					class="flex cursor-pointer items-center gap-3 px-3 py-2.5 first:rounded-t-md last:rounded-b-md hover:bg-neutral-800"
					:class="value.includes(option.value) ? 'bg-neutral-800' : ''"
					@click.self="onSelect(option.value)"
					@keydown.enter="onSelect(option.value)"
				>
					<Checkbox :id="`${id}-${option.value}`" :checked="value.includes(option.value)" :label="option.label" @change="onSelect(option.value)" />
				</div>
			</div>
		</div>
		<p :id="errorId" class="mt-0.5 h-4 text-xs text-red-400" aria-live="polite">
			{{ error }}
		</p>
	</div>
</template>
