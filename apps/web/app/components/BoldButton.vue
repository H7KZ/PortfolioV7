<script setup lang="ts">
import type { Component } from 'vue'

const {
	type = 'button',
	icon,
	disabled = false
} = defineProps<{
	type?: 'button' | 'submit' | 'reset'
	icon?: Component
	disabled?: boolean
}>()
const emit = defineEmits<{ click: [event: MouseEvent] }>()

const spinButton = ref(false)

function handleClick(event: MouseEvent): void {
	if (disabled) return
	spinButton.value = true
	setTimeout(() => (spinButton.value = false), 1050)
	emit('click', event)
}
</script>

<template>
	<button
		:type="type"
		:disabled="disabled"
		:aria-disabled="disabled"
		class="group flex h-10 cursor-pointer flex-row items-center justify-center transition-all disabled:cursor-not-allowed disabled:opacity-60"
		@click="handleClick"
	>
		<div
			class="flex h-full items-center justify-center rounded-full bg-neutral-50 px-4 text-center text-xl font-semibold text-background transition-all group-hover:bg-neutral-200 group-disabled:group-hover:bg-neutral-50"
		>
			<slot />
		</div>
		<div
			class="flex h-full w-10 -translate-x-0.75 transform items-center justify-center rounded-full bg-neutral-50 text-center font-bold text-background transition-all group-hover:bg-neutral-200 group-disabled:group-hover:bg-neutral-50"
		>
			<component :is="icon" v-if="icon" class="h-6 w-6 text-background" :class="spinButton ? 'transition-all duration-1000' : ''" />
		</div>
	</button>
</template>
