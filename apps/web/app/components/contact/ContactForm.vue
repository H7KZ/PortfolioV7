<script setup lang="ts">
import {
	buildContactSchema,
	contactFieldErrors,
	initialContactValues,
	MESSAGE_MAX_LENGTH,
	type ContactFormConfig,
	type ContactFormErrors,
	type ContactFormValues,
	type MultiSelect,
	type SingleSelect
} from '@portfolio/content/contact-form'
import TablerChevronDown from '~icons/tabler/chevron-down'

const { config, title, step, sentLabel } = defineProps<{
	config: ContactFormConfig
	title: string
	step?: string | null
	sentLabel?: string | null
}>()

const locale = useLocaleCode()
const { track } = useAnalytics()

const form = ref<ContactFormValues>(initialContactValues())
const errors = ref<ContactFormErrors>({})
const submitted = ref(false)
const serverError = ref(false)
const sending = ref(false)
const sentName = ref<string | null>(null)
const compact = ref(false)

const summary = useTemplateRef<HTMLElement>('summary')
const successTitle = useTemplateRef<HTMLElement>('successTitle')

const schema = computed(() => buildContactSchema(config))

/** Fields in the order they appear, with the id each one renders under. */
const FIELD_ORDER: (keyof ContactFormValues)[] = [
	'fullName',
	'email',
	'message',
	'budget',
	'company',
	'projectType',
	'features',
	'technologies',
	'assets',
	'audiences',
	'hosting',
	'support',
	'legals',
	'deadline',
	'priority'
]
const SINGLE: SingleSelect[] = ['projectType', 'hosting', 'support', 'priority']
const MULTI: MultiSelect[] = ['features', 'technologies', 'assets', 'audiences', 'legals']

function fieldId(field: keyof ContactFormValues): string {
	return `contact-${field}`
}

function fieldLabel(field: keyof ContactFormValues): string {
	const raw = (config[field as keyof ContactFormConfig] as { label?: string } | undefined)?.label ?? field
	const label = raw.replace(/\s*\*$/, '')
	return label.charAt(0).toLocaleLowerCase(locale.value) + label.slice(1)
}

const broken = computed(() => FIELD_ORDER.filter(field => errors.value[field]))
const advancedHasError = computed(() => broken.value.some(field => !['fullName', 'email', 'message', 'budget'].includes(field)))

/** The summary sentence with {fields} replaced by in-page links, joined the way the locale joins a list. */
const summaryParts = computed(() => {
	const template = broken.value.length === 1 ? config.validation.summaryOne : config.validation.summaryMany
	if (!template) return []
	const [before = '', after = ''] = template.replace('{count}', String(broken.value.length)).split('{fields}')
	const list = new Intl.ListFormat(locale.value, { type: 'conjunction' }).formatToParts(broken.value.map(field => `\u0000${field}`))
	return [
		{ text: before },
		...list.map(part => (part.type === 'element' ? { field: part.value.slice(1) as keyof ContactFormValues } : { text: part.value })),
		{ text: after }
	]
})

function validate(): boolean {
	const parsed = schema.value.safeParse(form.value)
	errors.value = parsed.success ? {} : contactFieldErrors(parsed.error)
	return parsed.success
}

watch(
	form,
	() => {
		if (submitted.value) validate()
	},
	{ deep: true }
)

const advanced = useTemplateRef<HTMLDetailsElement>('advanced')

function focusField(field: keyof ContactFormValues): void {
	if (advanced.value && !['fullName', 'email', 'message', 'budget'].includes(field)) advanced.value.open = true
	nextTick(() => {
		const target =
			document.getElementById(fieldId(field)) ??
			document.querySelector<HTMLElement>(`[name="${fieldId(field)}"]`) ??
			document.querySelector<HTMLElement>(`#${fieldId(field)} input`)
		target?.focus()
		target?.scrollIntoView({ block: 'center' })
	})
}

async function submit(): Promise<void> {
	if (sending.value) return
	submitted.value = true
	serverError.value = false
	if (!validate()) {
		await nextTick()
		summary.value?.focus()
		return
	}

	sending.value = true
	try {
		const response = await $fetch<{ ok: boolean; errors?: ContactFormErrors }>('/api/contact', {
			method: 'POST',
			body: { locale: locale.value, values: form.value },
			ignoreResponseError: true
		})
		if (!response?.ok) {
			if (response?.errors) errors.value = response.errors
			else serverError.value = true
			await nextTick()
			summary.value?.focus()
			return
		}
	} catch {
		serverError.value = true
		await nextTick()
		summary.value?.focus()
		return
	} finally {
		sending.value = false
	}

	track('contact-sent')
	sentName.value = form.value.fullName.trim().split(/\s+/)[0] ?? ''
	await nextTick()
	successTitle.value?.focus()
}

function reset(): void {
	form.value = initialContactValues()
	errors.value = {}
	submitted.value = false
	serverError.value = false
	sentName.value = null
	nextTick(() => document.getElementById(fieldId('fullName'))?.focus())
}

const successHeading = computed(() => {
	const success = config.success
	if (!success) return ''
	return sentName.value ? (success.title ?? '').replace('{name}', sentName.value) : (success.titleNoName ?? '')
})

const budgetOptions = computed(() => config.budget.options ?? [])
const placeholder = computed(() => (compact.value ? (config.message.placeholderShort ?? config.message.placeholder) : config.message.placeholder))

onMounted(() => {
	const query = window.matchMedia('(max-width: 1023px)')
	compact.value = query.matches
	query.addEventListener('change', event => (compact.value = event.matches))
})
</script>

<template>
	<section class="rounded-lg border border-line bg-surface" aria-labelledby="brief-title">
		<div class="flex items-baseline justify-between gap-4 border-b border-line px-6 py-5">
			<h2 id="brief-title" class="type-h3">{{ title }}</h2>
			<p class="type-mono-label" :class="sentName !== null ? 'text-accent' : 'text-mute'">{{ sentName !== null ? sentLabel : step }}</p>
		</div>

		<div aria-live="polite" class="p-6">
			<div v-if="sentName !== null" class="flex flex-col items-start gap-5">
				<span class="grid h-12 w-12 place-items-center rounded-full bg-accent-soft text-accent" aria-hidden="true">✓</span>
				<h3 ref="successTitle" tabindex="-1" class="type-h3 outline-none">{{ successHeading }}</h3>
				<p v-if="config.success?.body" class="max-w-[52ch] type-body text-ink-soft">{{ config.success.body }}</p>
				<UiButton kind="secondary" @click="reset">{{ config.success?.sendAnotherLabel }}</UiButton>
			</div>

			<form v-else novalidate class="flex flex-col gap-6" @submit.prevent="submit">
				<div
					v-if="serverError || broken.length"
					ref="summary"
					tabindex="-1"
					role="alert"
					class="flex gap-3 rounded-md border border-danger bg-danger-soft p-4 type-body-s text-ink"
				>
					<span aria-hidden="true" class="font-mono font-medium text-danger">!</span>
					<p v-if="serverError">{{ config.errorMessage }}</p>
					<p v-else>
						<template v-for="(part, index) in summaryParts" :key="index">
							<a
								v-if="'field' in part && part.field"
								:href="`#${fieldId(part.field)}`"
								class="text-ink underline decoration-danger underline-offset-4"
								@click.prevent="focusField(part.field)"
								>{{ fieldLabel(part.field) }}</a
							><template v-else>{{ part.text }}</template>
						</template>
					</p>
				</div>

				<div class="grid gap-6 md:grid-cols-2">
					<UiField
						:id="fieldId('fullName')"
						v-model="form.fullName"
						:label="config.fullName.label"
						:placeholder="config.fullName.placeholder"
						autocomplete="name"
						required
						:error="errors.fullName"
						@blur="submitted && validate()"
					/>
					<UiField
						:id="fieldId('email')"
						v-model="form.email"
						type="email"
						:label="config.email.label"
						:placeholder="config.email.placeholder"
						autocomplete="email"
						required
						:error="errors.email"
						@blur="submitted && validate()"
					/>
				</div>
				<UiField
					:id="fieldId('message')"
					v-model="form.message"
					multiline
					:label="config.message.label"
					:placeholder="placeholder"
					:maxlength="MESSAGE_MAX_LENGTH"
					required
					:error="errors.message"
					@blur="submitted && validate()"
				/>

				<div v-if="budgetOptions.length" :id="fieldId('budget')" class="flex flex-col gap-3">
					<p id="contact-budget-label" class="type-body-s font-medium text-ink">
						{{ config.budget.label }}
						<span v-if="config.budget.hint" class="font-normal text-mute">· {{ config.budget.hint }}</span>
					</p>
					<ChoiceChips v-model="form.budget" name="contact-budget" labelled-by="contact-budget-label" :options="budgetOptions" />
				</div>

				<details ref="advanced" class="group rounded-md border border-line" :open="advancedHasError || undefined">
					<summary class="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 [&::-webkit-details-marker]:hidden">
						<span class="flex flex-col">
							<span class="type-body-s font-medium text-ink">{{ config.advancedLabel }}</span>
							<span v-if="config.advancedHint" class="type-mono-s text-mute">{{ config.advancedHint }}</span>
						</span>
						<TablerChevronDown
							class="h-4 w-4 shrink-0 text-ink-soft transition-transform duration-200 ease-(--ease) group-open:rotate-180"
							aria-hidden="true"
						/>
					</summary>
					<div class="flex flex-col gap-6 border-t border-line p-4">
						<UiField
							:id="fieldId('company')"
							v-model="form.company"
							:label="config.company.label"
							:placeholder="config.company.placeholder"
							autocomplete="organization"
							:error="errors.company"
						/>
						<div class="grid gap-6 md:grid-cols-2">
							<SelectField
								v-for="field in SINGLE"
								:id="fieldId(field)"
								:key="field"
								v-model="form[field]"
								:label="config[field].label"
								:empty-option="config[field].emptyOption"
								:options="config[field].options ?? []"
								:error="errors[field]"
							/>
						</div>
						<CheckChips
							v-for="field in MULTI"
							:key="field"
							v-model="form[field]"
							:name="fieldId(field)"
							:legend="config[field].label"
							:options="config[field].options ?? []"
						/>
						<div class="md:w-1/2">
							<UiField :id="fieldId('deadline')" v-model="form.deadline" type="date" :label="config.deadline.label" :error="errors.deadline" />
						</div>
					</div>
				</details>

				<div class="flex flex-col-reverse gap-4 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
					<p v-if="config.privacyNote" class="type-body-s text-mute">{{ config.privacyNote }}</p>
					<UiButton type="submit" :busy="sending">{{ sending ? config.sendingLabel : config.sendLabel }}</UiButton>
				</div>
			</form>
		</div>
	</section>
</template>
