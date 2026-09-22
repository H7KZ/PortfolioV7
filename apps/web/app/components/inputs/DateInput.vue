<script setup lang="ts">
import type { Component } from 'vue'

const value = defineModel<string>({ required: true })
const { label, icon, required, error } = defineProps<{
	label?: string
	icon?: Component
	required?: boolean
	error?: string
}>()
const emit = defineEmits<{ input: [] }>()

const id = useId()
const errorId = `${id}-error`
const input = useTemplateRef<HTMLInputElement>('input')

function openPicker(): void {
	input.value?.showPicker?.()
}
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
				ref="input"
				v-model="value"
				type="date"
				class="date-input h-10 w-full rounded-md border-[1.5px] border-neutral-500 bg-[#ffffff03] p-2 pl-3.5 text-base text-white placeholder:text-neutral-500"
				:class="icon ? 'pl-11.5' : ''"
				:required="required"
				@input="emit('input')"
				@focus="openPicker"
				@click="openPicker"
			/>
			<div v-if="icon" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
				<component :is="icon" class="h-6 w-6 text-neutral-400" />
			</div>
		</div>
		<p :id="errorId" class="mt-0.5 h-4 text-xs text-red-400" aria-live="polite">
			{{ error }}
		</p>
	</div>
</template>

<style scoped>
.date-input::-webkit-calendar-picker-indicator {
	display: none;
}
</style>
