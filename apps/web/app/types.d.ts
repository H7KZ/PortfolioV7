/// <reference types="unplugin-icons/types/vue" />
export {}

declare global {
	interface Window {
		umami?: {
			track: (event: string, data?: Record<string, string | number | boolean>) => void
		}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		Cal: any
	}
}
