<script setup lang="ts">
const { calLink } = defineProps<{ calLink: string }>()

const element = useTemplateRef<HTMLDivElement>('calendar')
const { track } = useAnalytics()

onMounted(() => {
	if (!element.value) return
	const observer = new IntersectionObserver(
		entries => {
			if (!entries.some(entry => entry.isIntersecting)) return
			observer.disconnect()
			mountCalendar('cal', calLink)
			track('book-call', { from: 'calendar-visible' })
		},
		{ rootMargin: '0px' }
	)
	observer.observe(element.value)
	onBeforeUnmount(() => observer.disconnect())
})
</script>

<template>
	<div id="cal" ref="calendar" class="h-full w-full max-w-260 overflow-hidden!"></div>
</template>
