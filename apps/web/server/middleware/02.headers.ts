const CSP = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline'",
	"font-src 'self'",
	"img-src 'self' data: https:",
	"connect-src 'self'",
	"frame-src 'none'",
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
	'upgrade-insecure-requests'
].join('; ')

export default defineEventHandler(event => {
	if (!import.meta.dev) setResponseHeader(event, 'content-security-policy', CSP)
	setResponseHeaders(event, {
		'x-content-type-options': 'nosniff',
		'x-frame-options': 'DENY',
		'x-xss-protection': '0',
		'referrer-policy': 'strict-origin-when-cross-origin',
		'permissions-policy': 'camera=(), microphone=(), geolocation=()',
		'cross-origin-opener-policy': 'same-origin'
	})
	// The root redirects to /cs by Accept-Language or the locale cookie, so a shared cache must not reuse one answer for both.
	if (getRequestURL(event).pathname === '/') appendResponseHeader(event, 'vary', 'accept-language, cookie')
	// Draft pages must not land in a shared cache next to the published ones.
	if (isPreview(event)) setResponseHeader(event, 'cache-control', 'private, no-store')
	if (useRuntimeConfig().public.noindex) setResponseHeader(event, 'x-robots-tag', 'noindex, nofollow')
})
