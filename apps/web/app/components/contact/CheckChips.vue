<script setup lang="ts">
const model = defineModel<string[]>({ required: true })
const { name, legend, options } = defineProps<{ name: string; legend: string; options: { key: string; label: string }[] }>()

function toggle(key: string, checked: boolean): void {
	model.value = checked ? [...model.value, key] : model.value.filter(value => value !== key)
}
</script>

<template>
	<fieldset class="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
		<legend class="mb-3 p-0 type-body-s font-medium text-ink">{{ legend }}</legend>
		<div class="flex flex-wrap gap-2">
			<label
				v-for="option in options"
				:key="option.key"
				class="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 type-body-s transition-colors duration-150 ease-(--ease) has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
				:class="
					model.includes(option.key) ? 'border-accent bg-accent-soft text-ink' : 'border-control text-ink-soft hover:border-ink-soft hover:text-ink'
				"
			>
				<input
					type="checkbox"
					class="sr-only"
					:name="name"
					:value="option.key"
					:checked="model.includes(option.key)"
					@change="toggle(option.key, ($event.target as HTMLInputElement).checked)"
				/>
				<span v-if="model.includes(option.key)" aria-hidden="true" class="text-accent">✓</span>
				{{ option.label }}
			</label>
		</div>
	</fieldset>
</template>
