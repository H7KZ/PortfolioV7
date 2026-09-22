interface UmamiPayload {
	url?: string
	referrer?: string
	[key: string]: unknown
}

/** Keeps the origin and path only: query strings and fragments of referring pages can carry tokens. */
function stripQuery(url: string): string {
	return url.split(/[?#]/, 1)[0] ?? ''
}

export default defineNuxtPlugin(() => {
	const websiteId = useRuntimeConfig().public.umamiWebsiteId
	if (!websiteId || document.querySelector('script[data-website-id]')) return

	const preview = useState<boolean>('preview')

	// Returning null cancels the send: preview is the owner reading drafts, not a visit.
	window.__portfolioUmamiBeforeSend = (_type, payload) => {
		if (preview.value) return null
		const redacted = { ...payload }
		if (typeof payload.url === 'string') redacted.url = stripQuery(payload.url)
		if (typeof payload.referrer === 'string' && payload.referrer) redacted.referrer = stripQuery(payload.referrer)
		return redacted
	}

	const script = document.createElement('script')
	script.defer = true
	script.src = '/stats/stats.js'
	script.setAttribute('data-website-id', websiteId)
	script.setAttribute('data-host-url', `${window.location.origin}/stats`)
	script.setAttribute('data-exclude-search', 'true')
	script.setAttribute('data-exclude-hash', 'true')
	script.setAttribute('data-do-not-track', 'true')
	script.setAttribute('data-before-send', '__portfolioUmamiBeforeSend')
	document.head.appendChild(script)
})

declare global {
	interface Window {
		__portfolioUmamiBeforeSend?: (type: string, payload: UmamiPayload) => UmamiPayload | null
	}
}
