import { expect, test } from '@playwright/test'
import { LOCALES, localized, NOT_FOUND, open, OVERFLOW_WIDTHS, pinLocale, ROUTES } from './routes'

/** Gate G3: every route renders without console errors, failed requests or horizontal scroll. */
for (const locale of LOCALES) {
	for (const route of [...ROUTES, NOT_FOUND]) {
		test(`G3 ${locale} ${route}`, async ({ page }) => {
			await pinLocale(page, locale)
			const problems: string[] = []
			page.on('console', message => {
				if (message.type() === 'error') problems.push(`console: ${message.text()}`)
			})
			page.on('pageerror', error => problems.push(`pageerror: ${error.message}`))
			page.on('response', response => {
				const url = response.url()
				if (response.status() >= 400 && !url.endsWith(NOT_FOUND) && !url.includes(`${NOT_FOUND}?`)) problems.push(`${response.status()} ${url}`)
			})

			const response = await open(page, localized(route, locale))
			expect(response?.status()).toBe(route === NOT_FOUND ? 404 : 200)
			await expect(page.locator('h1')).toHaveCount(1)

			for (const width of OVERFLOW_WIDTHS) {
				await page.setViewportSize({ width, height: 900 })
				const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
				expect(overflow, `horizontal scroll at ${width}px`).toBeLessThanOrEqual(0)
			}

			expect(problems.filter(problem => !problem.includes('the server responded with a status of 404'))).toEqual([])
		})
	}
}

test('G3 old project URLs answer 301', async ({ request }) => {
	for (const [from, to] of [
		['/projects/corac_sith', '/projects/deeptrace'],
		['/projects/iont_info', '/projects/iont_platform'],
		['/projects/iont_charge', '/projects/iont_platform'],
		['/projects/iont_admin', '/projects/iont_platform'],
		['/cs/projects/corac_sith', '/cs/projects/deeptrace']
	]) {
		const response = await request.get(from!, { maxRedirects: 0 })
		expect(response.status(), from).toBe(301)
		expect(response.headers().location, from).toBe(to)
	}
})

test('G3 resume stats and stack use four columns on desktop', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 })
	await open(page, '/resume')
	const tracks = await page.evaluate(() =>
		[...document.querySelectorAll('main dl.grid, #skills-heading ~ div.grid, section[aria-labelledby="skills-heading"] > div.grid')].map(
			element => getComputedStyle(element).gridTemplateColumns.split(' ').length
		)
	)
	expect(tracks).toEqual([4, 4])
})
