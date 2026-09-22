export default defineEventHandler(event => {
	const { path, expires, token } = getQuery(event)
	if (typeof path !== 'string' || typeof expires !== 'string' || typeof token !== 'string' || !verifyPreviewLink(path, expires, token)) {
		throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
	}

	setCookie(event, PREVIEW_COOKIE, previewCookieValue(expires), {
		httpOnly: true,
		sameSite: 'lax',
		secure: !import.meta.dev,
		path: '/',
		expires: new Date(Number(expires))
	})
	return sendRedirect(event, path, 302)
})
