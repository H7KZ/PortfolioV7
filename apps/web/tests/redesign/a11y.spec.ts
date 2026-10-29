import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { LOCALES, localized, NOT_FOUND, open, pinLocale, ROUTES } from './routes'

/** Gate G5: axe at phone and desktop width, both locales, zero serious or critical findings. */
for (const locale of LOCALES) {
	for (const width of [390, 1440]) {
		for (const route of [...ROUTES, NOT_FOUND]) {
			test(`G5 axe ${locale} ${width} ${route}`, async ({ page }) => {
				await pinLocale(page, locale)
				await page.setViewportSize({ width, height: 900 })
				await open(page, localized(route, locale))
				const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
				const blocking = results.violations
					.filter(violation => violation.impact === 'serious' || violation.impact === 'critical')
					.map(violation => `${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`)
				expect(blocking).toEqual([])
			})
		}
	}
}

async function focusedText(page: Page): Promise<string> {
	return page.evaluate(() => (document.activeElement?.textContent ?? '').trim())
}

test('G5 keyboard: skip link is the first stop and lands on main', async ({ page }) => {
	await pinLocale(page, 'en')
	await open(page, '/')
	await page.keyboard.press('Tab')
	await expect(page.locator(':focus')).toHaveAttribute('href', '#main')
	await page.keyboard.press('Enter')
	await expect(page).toHaveURL(/#main$/)
})

test('G5 keyboard: interactive targets are at least 44px tall', async ({ page }) => {
	for (const width of [390, 1440]) {
		await page.setViewportSize({ width, height: 900 })
		for (const route of ['/', '/contact', '/projects/kreditozrouti', '/resume']) {
			await open(page, route)
			const small = await page.evaluate(() =>
				[...document.querySelectorAll<HTMLElement>('header a, header button, footer a, main a.inline-flex, main button, [role=radiogroup] label')]
					.filter(element => element.offsetParent !== null && !element.closest('.prose-site'))
					.filter(element => element.getBoundingClientRect().height < 43.5)
					.map(element => `${element.tagName} "${element.textContent?.trim().slice(0, 30)}" ${Math.round(element.getBoundingClientRect().height)}px`)
			)
			expect(small, `${route} at ${width}`).toEqual([])
		}
	}
})

test('G5 keyboard: mobile menu opens, traps focus, closes on Esc', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await pinLocale(page, 'en')
	await open(page, '/resume')
	const button = page.locator('button[aria-controls="mobile-menu"]')
	await button.focus()
	await page.keyboard.press('Enter')
	await expect(button).toHaveAttribute('aria-expanded', 'true')
	await expect(page.locator('#mobile-menu a').first()).toBeFocused()
	await expect(page.locator('main')).toHaveJSProperty('inert', true)
	for (let step = 0; step < 12; step += 1) {
		await page.keyboard.press('Tab')
		const inside = await page.evaluate(() => Boolean(document.activeElement?.closest('#mobile-menu, button[aria-controls="mobile-menu"]')))
		expect(inside).toBe(true)
	}
	await page.keyboard.press('Escape')
	await expect(page.locator('#mobile-menu')).toHaveCount(0)
	await expect(button).toBeFocused()
	await expect(page.locator('main')).toHaveJSProperty('inert', false)
})

test('G5 keyboard: contact form error summary, field links and success focus', async ({ page }) => {
	await pinLocale(page, 'en')
	await open(page, '/contact')
	await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0)

	await page.locator('form button[type="submit"]').click()
	const summary = page.locator('[role="alert"]')
	await expect(summary).toBeFocused()
	await expect(page.locator('[aria-invalid="true"]')).toHaveCount(3)

	await summary.locator('a[href="#contact-email"]').click()
	await expect(page.locator('#contact-email')).toBeFocused()

	await page.fill('#contact-fullName', 'Jana Nováková')
	await page.fill('#contact-email', 'jana@example.com')
	await page.fill('#contact-message', 'Playwright check: a scheduler for a team of twenty people.')
	await page.locator('[role="radiogroup"] label').nth(1).click()
	await page.locator('form button[type="submit"]').click()

	const title = page.locator('#brief-title ~ * h3, [aria-live] h3').first()
	await expect(title).toBeFocused({ timeout: 15_000 })
	expect(await focusedText(page)).toContain('Jana')
})
