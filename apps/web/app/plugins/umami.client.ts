export default defineNuxtPlugin(() => {
	const websiteId = useRuntimeConfig().public.umamiWebsiteId
	if (!websiteId || document.querySelector('script[data-website-id]')) return

	const script = document.createElement('script')
	script.defer = true
	script.src = '/stats/stats.js'
	script.setAttribute('data-website-id', websiteId)
	script.setAttribute('data-host-url', `${window.location.origin}/stats`)
	script.setAttribute('data-exclude-search', 'true')
	script.setAttribute('data-exclude-hash', 'true')
	script.setAttribute('data-do-not-track', 'true')
	document.head.appendChild(script)
})
