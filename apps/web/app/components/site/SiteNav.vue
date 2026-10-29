<script setup lang="ts">
import TablerMenu2 from '~icons/tabler/menu-2'
import TablerX from '~icons/tabler/x'

const { data: layout } = useLayoutContent()
const { items, isActive, otherLocale, languageNames, localePath, trackSwitch } = useNavigation(layout)
const href = useHref()
const route = useRoute()

const navigation = computed(() => layout.value?.navigation)
const menuOpen = useState('menu-open', () => false)
const menuButton = useTemplateRef<HTMLButtonElement>('menuButton')

function closeMenu(returnFocus = true): void {
	if (!menuOpen.value) return
	menuOpen.value = false
	if (returnFocus) nextTick(() => menuButton.value?.focus())
}

watch(
	() => route.fullPath,
	() => closeMenu(false)
)
</script>

<template>
	<header v-if="navigation" class="sticky top-0 z-40 border-b border-line bg-[color-mix(in_srgb,var(--color-bg)_88%,transparent)] backdrop-blur-md">
		<div class="site-container flex h-16 items-center justify-between gap-2 lg:h-18 sm:gap-4">
			<NuxtLink :to="href('/')" class="inline-flex min-h-11 items-center gap-1 type-mono-m text-ink no-underline" @click="closeMenu(false)">
				{{ navigation.wordmark }}<span class="inline-block h-4 w-2 bg-accent" aria-hidden="true"></span>
			</NuxtLink>

			<nav :aria-label="navigation.navLabel ?? undefined" class="max-md:hidden">
				<ul class="flex list-none items-center gap-8 p-0">
					<li v-for="item in items" :key="item.id ?? item.href">
						<UiLink :to="href(item.href)" :current="isActive(item)">{{ item.label }}</UiLink>
					</li>
				</ul>
			</nav>

			<div class="flex items-center gap-1 md:gap-6 sm:gap-3">
				<UiButton kind="secondary" size="small" :to="href(navigation.hire.href)">{{ navigation.hire.label }}</UiButton>
				<NuxtLink
					:to="localePath(otherLocale)"
					:hreflang="otherLocale"
					:lang="otherLocale"
					class="inline-flex min-h-11 min-w-11 items-center justify-center type-mono-label text-ink-soft no-underline transition-colors duration-150 ease-(--ease) hover:text-ink max-md:hidden"
					@click="trackSwitch(otherLocale)"
					>{{ navigation.toggleLanguageLabel
					}}<span v-if="languageNames?.[otherLocale]" class="sr-only"> ({{ languageNames[otherLocale] }})</span></NuxtLink
				>
				<button
					ref="menuButton"
					type="button"
					class="-mr-2 grid h-11 w-11 place-items-center rounded-md text-ink transition-colors duration-150 ease-(--ease) hover:bg-surface-2 md:hidden"
					:aria-expanded="menuOpen"
					aria-controls="mobile-menu"
					:aria-label="(menuOpen ? navigation.closeMenuLabel : navigation.toggleMenuLabel) ?? undefined"
					@click="menuOpen = !menuOpen"
				>
					<TablerX v-if="menuOpen" class="h-6 w-6" aria-hidden="true" />
					<TablerMenu2 v-else class="h-6 w-6" aria-hidden="true" />
				</button>
			</div>
		</div>

		<MobileMenu v-if="menuOpen && layout" :layout="layout" :menu-button="menuButton" @close="closeMenu()" />
		<!-- Without JavaScript the menu button does nothing, so phones get the links as a plain list instead. -->
		<nav :aria-label="navigation.navLabel ?? undefined" class="nojs-only site-container border-t border-line md:hidden">
			<ul class="flex list-none flex-wrap gap-x-6 p-0">
				<li v-for="item in items" :key="item.id ?? item.href">
					<UiLink :to="href(item.href)" :current="isActive(item)">{{ item.label }}</UiLink>
				</li>
				<li>
					<UiLink :to="localePath(otherLocale)">{{ navigation.toggleLanguageLabel }}</UiLink>
				</li>
			</ul>
		</nav>
	</header>
</template>
