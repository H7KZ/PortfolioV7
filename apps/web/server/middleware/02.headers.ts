const CSP = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline' https://app.cal.com",
	"style-src 'self' 'unsafe-inline'",
	"font-src 'self'",
	"img-src 'self' data: https:",
	"connect-src 'self' https://app.cal.com https://cal.com",
	'frame-src https://app.cal.com https://cal.com',
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
	if (useRuntimeConfig().public.noindex) setResponseHeader(event, 'x-robots-tag', 'noindex, nofollow')
})
