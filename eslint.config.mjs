// @ts-check
import eslint from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	{
		ignores: [
			'**/node_modules/**',
			'**/dist/**',
			'**/.output/**',
			'**/.nuxt/**',
			'**/.next/**',
			'**/.turbo/**',
			'**/next-env.d.ts',
			'apps/web/**/*.vue',
			'apps/cms/src/app/(payload)/**',
			'apps/cms/src/migrations/**',
			'packages/content/src/payload-types.ts'
		]
	},

	eslint.configs.recommended,
	...tseslint.configs.recommended,

	{
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.node,
				...globals.browser
			}
		},
		rules: {
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'prefer-const': ['error', { destructuring: 'all' }]
		}
	},

	prettierConfig
)
