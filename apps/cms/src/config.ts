const isProduction = process.env.NODE_ENV === 'production'

function list(value: string | undefined): string[] {
	return (value ?? '')
		.split(',')
		.map(item => item.trim())
		.filter(Boolean)
}

function required(name: string, fallback: string): string {
	const value = process.env[name]
	if (value) return value
	if (isProduction) missing.push(name)
	return fallback
}

const missing: string[] = []

export const config = {
	databaseUri: required('DATABASE_URI', 'postgres://portfolio:portfolio@127.0.0.1:45432/portfolio'),
	payloadSecret: required('PAYLOAD_SECRET', 'local-development-secret'),
	cmsUrl: required('CMS_URL', 'http://localhost:43000'),
	siteUrl: required('SITE_URL', 'http://localhost:45173'),
	previewSecret: required('PREVIEW_SECRET', 'local-preview-secret'),
	revalidateSecret: required('REVALIDATE_SECRET', 'local-revalidate-secret'),
	revalidateUrls: list(process.env.REVALIDATE_URLS ?? (isProduction ? '' : 'http://localhost:45173/_internal/revalidate')),
	discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL ?? '',
	mediaDir: process.env.MEDIA_DIR ?? ''
}

if (missing.length > 0 && process.env.PAYLOAD_SKIP_ENV_CHECK !== '1') {
	throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
}
