type ApiFunction = {
	(...args: unknown[]): void
	q: unknown[]
}

type CalObject = ApiFunction & {
	loaded?: boolean
	ns?: Record<string, ApiFunction>
}

const NAMESPACE = '30min'

function queueFunction(): ApiFunction {
	const api = function (...args: unknown[]): void {
		api.q.push(args)
	} as ApiFunction
	api.q = []
	return api
}

function install(): void {
	if (window.Cal) return

	const cal = function (...args: unknown[]): void {
		if (!cal.loaded) {
			cal.ns = {}
			cal.q = cal.q ?? []
			const script = document.createElement('script')
			script.src = 'https://app.cal.com/embed/embed.js'
			document.head.appendChild(script)
			cal.loaded = true
		}

		if (args[0] === 'init') {
			const namespace = args[1]
			if (typeof namespace === 'string') {
				cal.ns![namespace] = cal.ns![namespace] ?? queueFunction()
				cal.ns![namespace]!.q.push(args)
				cal.q.push(['initNamespace', namespace])
				return
			}
		}
		cal.q.push(args)
	} as CalObject
	cal.q = []
	window.Cal = cal
}

export function mountCalendar(elementId: string, calLink: string): void {
	install()
	window.Cal('init', NAMESPACE, { origin: 'https://cal.com' })
	const api = window.Cal.ns?.[NAMESPACE]
	if (!api) return

	api('inline', {
		elementOrSelector: `#${elementId}`,
		config: { layout: 'month_view', theme: 'dark' },
		calLink
	})
	api('ui', {
		theme: 'dark',
		cssVarsPerTheme: {
			light: { 'cal-brand': '#161616' },
			dark: { 'cal-brand': '#ffffff' }
		},
		hideEventTypeDetails: false,
		layout: 'month_view'
	})
}
