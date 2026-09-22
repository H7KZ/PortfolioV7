<script setup lang="ts">
import IconamoonArrowUp from '~icons/iconamoon/arrow-up-2'

const { title = '' } = defineProps<{ title?: string }>()

const isOpened = ref(false)
</script>

<template>
	<div class="flex h-full w-full flex-col gap-6">
		<button type="button" :aria-expanded="isOpened" class="flex cursor-pointer items-center gap-4" @click="isOpened = !isOpened">
			<IconamoonArrowUp class="h-5 w-5 shrink-0 rotate-90 text-neutral-400 transition-all" :class="isOpened ? 'rotate-180' : ''" />
			<p class="shrink-0 text-sm text-neutral-300 italic">
				{{ title }}
			</p>
			<div class="mr-1.5 ml-2.5 h-px w-full bg-neutral-700"></div>
		</button>

		<div class="accordion-body w-full" :class="isOpened ? 'is-open' : ''">
			<div class="accordion-body-inner">
				<slot />
			</div>
		</div>
	</div>
</template>
