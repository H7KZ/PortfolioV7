<script setup lang="ts">
const { data: layout } = useLayoutContent()
const { isActive, switchLocale, currentLocale, otherLocale, items } = useNavigation(layout)
const href = useHref()

const menuOpen = ref(false)

function onSwitchLocale(): void {
	menuOpen.value = false
	switchLocale()
}
</script>

<template>
	<div v-if="layout" class="sticky top-0 z-40 border-b border-(--line) bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-[14px]">
		<div class="flex items-center justify-between px-5 py-3.5">
			<NuxtLink
				:to="href('/')"
				:aria-label="layout.navigation.homeLabel"
				class="serif grid h-9 w-9 place-items-center rounded-full border border-(--line-2) text-[20px] font-normal text-(--fg) no-underline transition-[border-color] duration-200"
				@click="menuOpen = false"
				>{{ layout.navigation.monogram }}</NuxtLink
			>

			<div class="flex items-center gap-3">
				<NuxtLink
					:to="href(layout.navigation.hire.href)"
					class="inline-flex items-center gap-1.75 rounded-full border border-(--line-2) px-3.5 py-1.75 text-[12px] text-(--fg) no-underline transition-all duration-200 hover:border-(--accent) hover:text-(--accent)"
					@click="menuOpen = false"
				>
					<span
						class="dot h-1.5 w-1.5 shrink-0 animate-[dot-pulse_2.4s_ease-in-out_infinite] rounded-full bg-(--accent) shadow-[0_0_10px_var(--accent)]"
					></span>
					{{ layout.navigation.hire.label }}
				</NuxtLink>
				<button
					:aria-label="layout.navigation.toggleMenuLabel"
					:aria-expanded="menuOpen"
					class="grid cursor-pointer place-items-center rounded-md border-0 bg-transparent p-1 text-(--fg-2) transition-colors duration-150 hover:text-(--fg)"
					@click="menuOpen = !menuOpen"
				>
					<svg v-if="menuOpen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 6L6 18M6 6l12 12" />
					</svg>
					<svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M3 12h18M3 6h18M3 18h18" />
					</svg>
				</button>
			</div>
		</div>

		<div v-if="menuOpen" class="flex flex-col gap-1 px-5 pt-2 pb-5">
			<NuxtLink
				v-for="item in items"
				:key="item.id ?? item.href"
				:to="href(item.href)"
				class="border-b border-(--line) py-2.5 text-[15px] no-underline transition-colors duration-150"
				:class="isActive(item) ? 'text-(--fg)' : 'text-(--fg-2) hover:text-(--fg)'"
				@click="menuOpen = false"
				>{{ item.label }}</NuxtLink
			>
			<button
				class="cursor-pointer border-0 bg-transparent px-0 py-2 text-left text-[11px] font-(--font-mono) tracking-[0.08em] text-(--fg-4) transition-colors duration-150 hover:text-(--fg)"
				@click="onSwitchLocale"
			>
				{{ currentLocale.toUpperCase() }}
				/ {{ otherLocale.toUpperCase() }}
			</button>
		</div>
	</div>
</template>
