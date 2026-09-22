export default defineEventHandler(event => {
	deleteCookie(event, PREVIEW_COOKIE, { path: '/' })
	const back = getQuery(event).path
	return sendRedirect(event, typeof back === 'string' && back.startsWith('/') && !back.startsWith('//') ? back : '/', 302)
})
