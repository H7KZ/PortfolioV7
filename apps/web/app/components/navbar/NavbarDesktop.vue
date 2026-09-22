<script setup lang="ts">
const { data: layout } = useLayoutContent()
const { isActive, switchLocale, currentLocale, items } = useNavigation(layout)
const href = useHref()
</script>

<template>
	<div v-if="layout" class="sticky top-0 z-40 border-b border-(--line) bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] backdrop-blur-[14px]">
		<div class="mx-auto flex max-w-(--max) items-center justify-between px-8 py-4">
			<NuxtLink
				:to="href('/')"
				:aria-label="layout.navigation.homeLabel"
				class="serif grid h-9.5 w-9.5 place-items-center rounded-full border border-(--line-2) text-[22px] font-normal text-(--fg) no-underline transition-[border-color] duration-200 hover:border-(--fg-3)"
				>{{ layout.navigation.monogram }}</NuxtLink
			>

			<div class="flex items-center gap-7">
				<NuxtLink
					v-for="item in items"
					:key="item.id ?? item.href"
					:to="href(item.href)"
					class="text-sm text-(--fg-2) no-underline transition-colors duration-200 hover:text-(--fg)"
					:class="isActive(item) ? 'text-(--fg)' : ''"
					:aria-current="isActive(item) ? 'page' : undefined"
				>
					{{ item.label }}
					<span v-if="isActive(item)" class="mt-0.75 block h-px bg-(--fg) opacity-40"></span>
				</NuxtLink>
				<NuxtLink
					:to="href(layout.navigation.hire.href)"
					class="inline-flex items-center gap-2 rounded-full border border-(--line-2) px-4.5 py-2 text-[13px] text-(--fg-2) no-underline transition-all duration-200 hover:border-(--accent) hover:text-(--accent)"
				>
					<span
						class="dot h-1.5 w-1.5 shrink-0 animate-[dot-pulse_2.4s_ease-in-out_infinite] rounded-full bg-(--accent) shadow-[0_0_10px_var(--accent)]"
					></span>
					{{ layout.navigation.hire.label }}
				</NuxtLink>
				<button
					class="cursor-pointer rounded-md border-0 bg-transparent px-2.5 py-1.5 text-[11px] font-(--font-mono) tracking-[0.08em] text-(--fg-3) transition-all duration-150 hover:bg-(--bg-3) hover:text-(--fg)"
					:aria-label="layout.navigation.toggleLanguageLabel"
					@click="switchLocale"
				>
					{{ currentLocale.toUpperCase() }}
				</button>
			</div>
		</div>
	</div>
</template>
