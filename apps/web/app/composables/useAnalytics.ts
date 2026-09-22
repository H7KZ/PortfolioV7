type EventData = Record<string, string | number | boolean>

export type AnalyticsEvent = 'book-call' | 'contact-sent' | 'cv-download' | 'project-open' | 'locale-switch' | 'outbound-click'

export function useAnalytics() {
	return {
		track(event: AnalyticsEvent, data?: EventData): void {
			if (import.meta.server) return
			window.umami?.track(event, data)
		},
		trackLink(href: string): void {
			if (import.meta.server) return
			if (href.startsWith('mailto:')) window.umami?.track('outbound-click', { target: 'email' })
			else if (href.includes('linkedin.com')) window.umami?.track('outbound-click', { target: 'linkedin' })
		}
	}
}
