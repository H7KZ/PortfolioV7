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
	// Figma shows the too-short text for an empty message; the shared schema reports it as required.
	if (errors.value.message && config.validation.tooShort && form.value.message.trim() === '') errors.value.message = config.validation.tooShort
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
	<section class="flex flex-col gap-4.5 rounded-lg border border-line bg-surface p-5 md:p-7 lg:gap-5" aria-labelledby="brief-title">
		<div class="flex items-center justify-between gap-4">
			<h2 id="brief-title" class="type-h3">{{ title }}</h2>
			<p class="type-mono-s" :class="sentName !== null ? 'text-accent' : 'text-mute'">{{ sentName !== null ? sentLabel : step }}</p>
		</div>

		<div aria-live="polite">
			<div v-if="sentName !== null" class="flex flex-col gap-4.5 lg:gap-5">
				<div class="flex flex-col items-start gap-4 pt-2">
					<span class="grid h-12 w-12 place-items-center rounded-full bg-accent-soft type-mono-m text-accent" aria-hidden="true">✓</span>
					<h3 ref="successTitle" tabindex="-1" class="type-h3 outline-none">{{ successHeading }}</h3>
					<p v-if="config.success?.body" class="type-body text-ink-soft">{{ config.success.body }}</p>
				</div>
				<div>
					<UiButton kind="secondary" class="w-full md:w-auto" @click="reset">{{ config.success?.sendAnotherLabel }}</UiButton>
				</div>
			</div>

			<form v-else novalidate class="flex flex-col gap-4.5 lg:gap-5" @submit.prevent="submit">
				<div
					v-if="serverError || broken.length"
					ref="summary"
					tabindex="-1"
					role="alert"
					class="flex items-start gap-2.5 rounded-[8px] border border-danger bg-danger-soft px-4 py-3.5 type-body-s text-ink"
				>
					<span aria-hidden="true" class="type-mono-s text-danger">!</span>
					<p v-if="serverError" class="min-w-0 flex-1">{{ config.errorMessage }}</p>
					<p v-else class="min-w-0 flex-1">
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

				<div class="grid items-start gap-4 md:grid-cols-2">
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
					<p id="contact-budget-label" class="flex items-start justify-between gap-4 type-body-s text-ink-soft">
						{{ config.budget.label }}
						<span v-if="config.budget.hint" class="type-mono-s text-faint">{{ config.budget.hint }}</span>
					</p>
					<ChoiceChips v-model="form.budget" name="contact-budget" labelled-by="contact-budget-label" :options="budgetOptions" />
				</div>

				<details ref="advanced" class="group border-y border-line" :open="advancedHasError || undefined">
					<summary
						class="flex min-h-11 cursor-pointer list-none items-center gap-2.5 py-3.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus [&::-webkit-details-marker]:hidden"
					>
						<span class="type-mono-m text-accent" aria-hidden="true"
							><span class="group-open:hidden">+</span><span class="hidden group-open:inline">−</span></span
						>
						<span class="type-body text-ink">{{ config.advancedLabel }}</span>
						<span v-if="config.advancedHint" class="type-mono-s text-faint max-lg:hidden">{{ config.advancedHint }}</span>
					</summary>
					<div class="flex flex-col gap-6 pt-2 pb-5">
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

				<div class="flex flex-col-reverse gap-4.5 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
					<p v-if="config.privacyNote" class="type-mono-s text-balance text-faint lg:min-w-0 lg:flex-1">{{ config.privacyNote }}</p>
					<UiButton type="submit" :busy="sending" class="max-lg:w-full lg:shrink-0">{{ sending ? config.sendingLabel : config.sendLabel }}</UiButton>
				</div>
			</form>
		</div>
	</section>
</template>
