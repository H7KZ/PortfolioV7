import tailwindcss from '@tailwindcss/vite'
import Icons from 'unplugin-icons/vite'

export default defineNuxtConfig({
	compatibilityDate: '2026-09-01',
	devtools: { enabled: false },
	telemetry: false,

	modules: ['@nuxtjs/i18n'],

	css: ['~/assets/css/app.css'],

	components: [{ path: '~/components', pathPrefix: false }],

	app: {
		head: {
			htmlAttrs: { lang: 'en' },
			bodyAttrs: { class: 'min-h-full' },
			meta: [
				{ charset: 'utf-8' },
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
				{ name: 'theme-color', content: '#0b0d10' },
				{ name: 'apple-mobile-web-app-title', content: 'Jan Komínek' },
				{ name: 'google', content: 'notranslate' },
				{ name: 'format-detection', content: 'telephone=no' }
			],
			script: [{ innerHTML: "document.documentElement.classList.add('js')" }],
			link: [
				{ rel: 'icon', href: '/favicon.png' },
				{ rel: 'icon', type: 'image/png', href: '/favicon/favicon-96x96.png', sizes: '96x96' },
				{ rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' },
				{ rel: 'shortcut icon', href: '/favicon/favicon.ico' },
				{ rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
				{ rel: 'manifest', href: '/favicon/site.webmanifest' },
				{ rel: 'author', href: '/humans.txt' },
				{ rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/space-grotesk-latin-wght-normal.woff2', crossorigin: '' }
			]
		}
	},

	// The whole stylesheet is about 10 kB gzip, so inlining it beats a render-blocking request on a phone.
	features: {
		inlineStyles: true
	},

	experimental: {
		viewTransition: true
	},

	i18n: {
		strategy: 'prefix_except_default',
		defaultLocale: 'en',
		locales: [
			{ code: 'en', language: 'en', name: 'English' },
			{ code: 'cs', language: 'cs', name: 'Čeština' }
		],
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: 'locale',
			redirectOn: 'root',
			alwaysRedirect: false
		},
		baseUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:45173'
	},

	runtimeConfig: {
		cmsInternalUrl: 'http://localhost:43000',
		cmsReadApiKey: '',
		cmsContactApiKey: '',
		previewSecret: 'local-preview-secret',
		revalidateSecret: 'local-revalidate-secret',
		public: {
			siteUrl: 'http://localhost:45173',
			umamiWebsiteId: '',
			noindex: false
		}
	},

	nitro: {
		storage: {
			content: { driver: 'memory' }
		},
		compressPublicAssets: true
	},

	routeRules: {
		'/fonts/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
		'/favicon/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
		'/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } }
	},

	vite: {
		plugins: [tailwindcss(), Icons({ compiler: 'vue3' })]
	},

	typescript: {
		strict: true
	}
})
