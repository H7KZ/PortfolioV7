<script setup lang="ts">
import IconamoonArrowUp from '~icons/iconamoon/arrow-up-2'

interface Option {
	value: string
	label: string
}

const value = defineModel<string>({ required: true })
const { options, height, label, required, error, placeholder } = defineProps<{
	options: Option[]
	height?: number
	label?: string
	required?: boolean
	error?: string
	placeholder?: string
}>()
const emit = defineEmits<{ input: [] }>()

const id = useId()
const errorId = `${id}-error`
const root = useTemplateRef<HTMLDivElement>('root')
const isOpened = ref(false)

useClickOutside(root, () => (isOpened.value = false))

const selectedLabel = computed(() => options.find(option => option.value === value.value)?.label ?? placeholder)

function onSelect(optionValue: string): void {
	value.value = optionValue
	isOpened.value = false
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
				class="flex h-10 w-full cursor-pointer items-center justify-between rounded-md border-[1.5px] border-neutral-500 bg-[#ffffff03] p-2 px-3 text-base"
				:class="!value ? 'text-neutral-500' : ''"
				@click="isOpened = !isOpened"
				@keydown.enter="isOpened = !isOpened"
			>
				<p class="truncate">
					{{ selectedLabel }}
				</p>
				<IconamoonArrowUp class="h-7 w-7 text-neutral-400 transition-all" :class="isOpened ? 'rotate-180' : ''" />
			</div>

			<div
				v-if="isOpened"
				class="absolute z-50 mt-1 w-full rounded-md border-[1.5px] border-neutral-500 bg-neutral-900"
				:style="{ maxHeight: `${height}rem`, overflowY: 'auto' }"
			>
				<div
					v-for="option in options"
					:key="option.value"
					role="option"
					tabindex="0"
					:aria-selected="value === option.value"
					class="flex cursor-pointer items-center px-3 py-2.5 text-neutral-300 first:rounded-t-md last:rounded-b-md hover:bg-neutral-800"
					:class="value === option.value ? 'bg-neutral-800' : ''"
					@click="onSelect(option.value)"
					@keydown.enter="onSelect(option.value)"
				>
					{{ option.label }}
				</div>
			</div>
		</div>
		<p :id="errorId" class="mt-0.5 h-4 text-xs text-red-400" aria-live="polite">
			{{ error }}
		</p>
	</div>
</template>
