const RESET_AFTER_MS = 1800

/** One delegated listener covers every code block, including ones that arrive with a client-side navigation. */
export default defineNuxtPlugin(() => {
	document.addEventListener('click', event => {
		const button = (event.target as Element | null)?.closest<HTMLButtonElement>('button.code-copy')
		const code = button?.closest('.code-block')?.querySelector('pre')?.textContent
		if (!button || code == null) return

		navigator.clipboard
			.writeText(code.replace(/\n$/, ''))
			.then(() => {
				button.dataset.label ??= button.textContent ?? ''
				const label = button.dataset.label
				button.textContent = button.dataset.copied || label
				window.setTimeout(() => (button.textContent = label), RESET_AFTER_MS)
			})
			.catch(() => {})
	})
})
