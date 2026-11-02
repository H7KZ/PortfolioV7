import { expect, test } from '@playwright/test'
import { DESIGN_WIDTHS, LOCALES, localized, NOT_FOUND, open, pinLocale, ROUTES, slug } from './routes'

/**
 * Gate G4 baselines: every route at the three design widths in both locales. Off unless REDESIGN_VISUAL=1, because
 * baselines are only written after visual-qa approves them, and in the Playwright Docker image so fonts render the same.
 */
test.skip(process.env.REDESIGN_VISUAL !== '1', 'set REDESIGN_VISUAL=1 to compare screenshots')

for (const locale of LOCALES) {
	for (const width of DESIGN_WIDTHS) {
		for (const route of [...ROUTES, NOT_FOUND]) {
			test(`G4 ${locale} ${width} ${route}`, async ({ page }) => {
				await pinLocale(page, locale)
				await page.setViewportSize({ width, height: 900 })
				await open(page, localized(route, locale))
				await expect(page).toHaveScreenshot(`${slug(route)}-${locale}-${width}.png`, { fullPage: true })
			})
		}
	}
}
