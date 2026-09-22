<script setup lang="ts">
import {
	buildContactSchema,
	contactFieldErrors,
	initialContactValues,
	type ContactFormConfig,
	type ContactFormErrors,
	type ContactFormValues,
	type MultiSelect,
	type SingleSelect
} from '@portfolio/content/contact-form'
import MynaUiSend from '~icons/mynaui/send'
import TablerCalendarWeek from '~icons/tabler/calendar-week'

import DateInput from './inputs/DateInput.vue'
import MultiSelectInput from './inputs/MultiSelectInput.vue'
import SelectInput from './inputs/SelectInput.vue'
import SliderInput from './inputs/SliderInput.vue'
import TextAreaInput from './inputs/TextAreaInput.vue'
import TextInput from './inputs/TextInput.vue'

const { config, email } = defineProps<{ config: ContactFormConfig; email: string }>()

const locale = useLocaleCode()
const { track } = useAnalytics()

const form = ref<ContactFormValues>(initialContactValues(config))
const errors = ref<ContactFormErrors>({})
const apiError = ref('')
const success = ref('')
const loading = ref(false)

const schema = computed(() => buildContactSchema(config))

function singleOptions(field: SingleSelect) {
	return [{ value: '', label: config[field].emptyOption }, ...(config[field].options ?? []).map(option => ({ value: option.key, label: option.label }))]
}

function multiOptions(field: MultiSelect) {
	return (config[field].options ?? []).map(option => ({ value: option.key, label: option.label }))
}

function clear(field: keyof ContactFormValues): void {
	errors.value = { ...errors.value, [field]: undefined }
}

function money(value: number): string {
	return `${config.budget.currency} ${thousands(value)}`
}

async function handleSubmit(event: MouseEvent): Promise<void> {
	event.preventDefault()
	if (loading.value) return

	const parsed = schema.value.safeParse(form.value)
	if (!parsed.success) {
		errors.value = contactFieldErrors(parsed.error)
		return
	}

	loading.value = true
	apiError.value = ''
	try {
		const response = await $fetch<{ ok: boolean; errors?: ContactFormErrors }>('/api/contact', {
			method: 'POST',
			body: { locale: locale.value, values: form.value },
			ignoreResponseError: true
		})
		if (!response?.ok) {
			if (response?.errors) errors.value = response.errors
			else apiError.value = config.errorMessage
			return
		}
	} catch {
		apiError.value = config.errorMessage
		return
	} finally {
		loading.value = false
	}

	track('contact-sent')
	success.value = config.successMessage
	errors.value = {}

	setTimeout(() => {
		success.value = ''
		form.value = initialContactValues(config)
	}, 20000)
}
</script>

<template>
	<form class="flex w-full flex-col gap-3">
		<div class="flex w-full flex-col gap-3 sm:flex-row sm:gap-8">
			<TextInput
				v-model="form.fullName"
				:label="config.fullName.label"
				:placeholder="config.fullName.placeholder"
				required
				:error="errors.fullName"
				@input="clear('fullName')"
			/>
			<TextInput
				v-model="form.email"
				type="email"
				autocomplete="email"
				:label="config.email.label"
				:placeholder="config.email.placeholder"
				required
				:error="errors.email"
				@input="clear('email')"
			/>
		</div>
		<TextAreaInput
			v-model="form.message"
			:height="14"
			:label="config.message.label"
			:placeholder="config.message.placeholder"
			required
			:error="errors.message"
			@input="clear('message')"
		/>
		<SliderInput
			v-model="form.budget"
			:value-label="money"
			:min="config.budget.min"
			:min-label="money(config.budget.min)"
			:max="config.budget.max"
			:max-label="`${money(config.budget.max)}+`"
			:step="config.budget.step"
			:label="config.budget.label"
			required
			:error="errors.budget"
			@input="clear('budget')"
		/>
		<Accordion :title="config.advancedLabel">
			<div class="flex w-full flex-col gap-3">
				<div class="w-full xl:w-1/2">
					<TextInput
						v-model="form.company"
						:label="config.company.label"
						:placeholder="config.company.placeholder"
						:error="errors.company"
						@input="clear('company')"
					/>
				</div>
				<div class="flex w-full flex-col gap-3 xl:flex-row xl:gap-8">
					<div class="w-full xl:max-w-1/2">
						<SelectInput
							v-model="form.projectType"
							:options="singleOptions('projectType')"
							:height="20"
							:label="config.projectType.label"
							:error="errors.projectType"
							@input="clear('projectType')"
						/>
					</div>
					<div class="w-full xl:max-w-1/2">
						<MultiSelectInput
							v-model="form.features"
							:options="multiOptions('features')"
							:height="20"
							:label="config.features.label"
							:placeholder="config.features.placeholder"
							:error="errors.features"
							@input="clear('features')"
						/>
					</div>
				</div>
				<div class="flex w-full flex-col gap-3 xl:flex-row xl:gap-8">
					<div class="w-full xl:max-w-1/2">
						<MultiSelectInput
							v-model="form.technologies"
							:options="multiOptions('technologies')"
							:height="20"
							:label="config.technologies.label"
							:placeholder="config.technologies.placeholder"
							:error="errors.technologies"
							@input="clear('technologies')"
						/>
					</div>
					<div class="w-full xl:max-w-1/2">
						<MultiSelectInput
							v-model="form.assets"
							:options="multiOptions('assets')"
							:height="20"
							:label="config.assets.label"
							:placeholder="config.assets.placeholder"
							:error="errors.assets"
							@input="clear('assets')"
						/>
					</div>
				</div>
				<div class="flex w-full flex-col gap-3 xl:flex-row xl:gap-8">
					<div class="w-full xl:max-w-1/2">
						<MultiSelectInput
							v-model="form.audiences"
							:options="multiOptions('audiences')"
							:height="20"
							:label="config.audiences.label"
							:placeholder="config.audiences.placeholder"
							:error="errors.audiences"
							@input="clear('audiences')"
						/>
					</div>
					<div class="w-full xl:max-w-1/2">
						<SelectInput
							v-model="form.hosting"
							:options="singleOptions('hosting')"
							:height="20"
							:label="config.hosting.label"
							:error="errors.hosting"
							@input="clear('hosting')"
						/>
					</div>
				</div>
				<div class="flex w-full flex-col gap-3 xl:flex-row xl:gap-8">
					<div class="w-full xl:max-w-1/2">
						<SelectInput
							v-model="form.support"
							:options="singleOptions('support')"
							:height="20"
							:label="config.support.label"
							:error="errors.support"
							@input="clear('support')"
						/>
					</div>
					<div class="w-full xl:max-w-1/2">
						<MultiSelectInput
							v-model="form.legals"
							:options="multiOptions('legals')"
							:height="20"
							:label="config.legals.label"
							:placeholder="config.legals.placeholder"
							:error="errors.legals"
							@input="clear('legals')"
						/>
					</div>
				</div>
				<div class="flex w-full flex-col gap-3 sm:flex-row sm:gap-8">
					<div class="w-full xl:w-52 xl:shrink-0">
						<DateInput
							v-model="form.deadline"
							:label="config.deadline.label"
							:icon="TablerCalendarWeek"
							:error="errors.deadline"
							@input="clear('deadline')"
						/>
					</div>
					<div class="w-full">
						<SelectInput
							v-model="form.priority"
							:options="singleOptions('priority')"
							:height="20"
							:label="config.priority.label"
							:error="errors.priority"
							@input="clear('priority')"
						/>
					</div>
				</div>
			</div>
		</Accordion>
		<div class="mt-4 flex w-full flex-col items-end gap-4">
			<BoldButton :icon="MynaUiSend" type="submit" :disabled="loading" @click="handleSubmit">
				{{ loading ? config.sendingLabel : config.sendLabel }}
			</BoldButton>
			<div class="flex h-4 items-center gap-2 text-sm">
				<p v-if="apiError" class="text-red-400">
					{{ apiError }} <a :href="`mailto:${email}`" class="underline">{{ email }}</a>
				</p>
				<p v-else-if="success" class="text-green-400">{{ success }}</p>
			</div>
		</div>
	</form>
</template>
