import { defineConfig, devices } from '@playwright/test'
import { BASE_URL } from './tests/redesign/routes'

/** The V7 redesign checks (docs/redesign/LOOP.md gates G3 to G5). They run against a site that is already up. */
export default defineConfig({
	testDir: './tests/redesign',
	outputDir: './tests/redesign/out/results',
	snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
	fullyParallel: true,
	workers: process.env.CI ? 2 : 4,
	retries: 0,
	timeout: 60_000,
	reporter: [['list'], ['html', { outputFolder: './tests/redesign/out/report', open: 'never' }]],
	use: {
		baseURL: BASE_URL,
		trace: 'retain-on-failure',
		colorScheme: 'dark',
		locale: 'en-GB'
	},
	expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } },
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
})
