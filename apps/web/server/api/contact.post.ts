import { buildContactSchema, contactFieldErrors, describeSelections, type ContactFormConfig, type ContactFormValues } from '@portfolio/content/contact-form'

const MAX_BODY_BYTES = 50_000

export default defineEventHandler(async event => {
	if (Number(getHeader(event, 'content-length') ?? 0) > MAX_BODY_BYTES) throw createError({ statusCode: 413, statusMessage: 'Payload Too Large' })
	if (!getHeader(event, 'content-type')?.includes('application/json')) throw createError({ statusCode: 415, statusMessage: 'Unsupported Media Type' })

	const { public: publicConfig, cmsInternalUrl, cmsContactApiKey } = useRuntimeConfig()
	const origin = getHeader(event, 'origin')
	if (origin && origin !== publicConfig.siteUrl && !import.meta.dev) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
	if (rateLimited(event)) throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })

	const body = await readBody<{ locale?: string; values?: ContactFormValues }>(event).catch(() => null)
	if (!body?.values) throw createError({ statusCode: 400, statusMessage: 'Bad Request' })

	const locale = body.locale === 'cs' ? 'cs' : 'en'
	const { form } = await content().contact(locale, false)
	const config = form as unknown as ContactFormConfig
	const parsed = buildContactSchema(config).safeParse(body.values)
	if (!parsed.success) {
		setResponseStatus(event, 400)
		return { ok: false, errors: contactFieldErrors(parsed.error) }
	}

	const values = parsed.data
	const response = await fetch(`${cmsInternalUrl}/api/contact-submissions`, {
		method: 'POST',
		headers: { 'content-type': 'application/json', authorization: `users API-Key ${cmsContactApiKey}` },
		body: JSON.stringify({
			fullName: values.fullName,
			email: values.email,
			company: values.company || null,
			message: values.message,
			budgetRange: values.budget || null,
			details: describeSelections(values, config),
			deadline: values.deadline ? new Date(values.deadline).toISOString() : null,
			locale
		}),
		signal: AbortSignal.timeout(15_000)
	}).catch(() => null)

	if (!response?.ok) {
		console.error(`contact.store_failed status=${response?.status ?? 'unreachable'}`)
		throw createError({ statusCode: 502, statusMessage: 'Bad Gateway' })
	}

	return { ok: true }
})
