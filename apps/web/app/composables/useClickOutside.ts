import type { Ref } from 'vue'

export function useClickOutside(target: Ref<HTMLElement | null>, callback: () => void): void {
	function handle(event: Event): void {
		if (target.value && !target.value.contains(event.target as Node) && !event.defaultPrevented) callback()
	}

	onMounted(() => {
		document.addEventListener('click', handle)
		document.addEventListener('mousedown', handle)
	})
	onBeforeUnmount(() => {
		document.removeEventListener('click', handle)
		document.removeEventListener('mousedown', handle)
	})
}
