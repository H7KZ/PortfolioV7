<script setup lang="ts">
const { data: layout } = useLayoutContent()
const { items, currentOf, otherLocale, languageNames, localePath, trackSwitch } = useNavigation(layout)
const href = useHref()
const route = useRoute()

const navigation = computed(() => layout.value?.navigation)
/** The Figma wordmark tints the dot before the TLD. */
const wordmark = computed(() => {
	const text = navigation.value?.wordmark ?? ''
	const dot = text.lastIndexOf('.')
	return dot > 0 ? { head: text.slice(0, dot), dot: '.', tail: text.slice(dot + 1) } : { head: text, dot: '', tail: '' }
})
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
	<header v-if="navigation" class="sticky top-0 z-40 border-b border-line bg-bg">
		<div class="site-container flex items-center justify-between gap-2 py-3.5 md:py-5">
			<NuxtLink :to="href('/')" class="inline-flex min-h-11 items-center gap-2 rounded-[4px] type-mono-m text-ink no-underline" @click="closeMenu(false)">
				<svg class="h-[18px] w-[9px] shrink-0 text-accent" viewBox="0 0 9 18" fill="currentColor" aria-hidden="true">
					<path d="M0 0H9L4.5 4.5L2.5 9L5.5 11L9 18H0V0Z" />
				</svg>
				<span
					>{{ wordmark.head }}<span v-if="wordmark.dot" class="text-accent">{{ wordmark.dot }}</span
					>{{ wordmark.tail }}</span
				>
			</NuxtLink>

			<div class="flex items-center gap-3.5 md:gap-8">
				<nav :aria-label="navigation.navLabel ?? undefined" class="max-md:hidden">
					<ul class="flex list-none items-center gap-7 p-0">
						<li v-for="item in items" :key="item.id ?? item.href">
							<UiLink :to="href(item.href)" :current="currentOf(item)">{{ item.label }}</UiLink>
						</li>
					</ul>
				</nav>

				<UiButton kind="secondary" size="small" dot class="max-[359px]:hidden md:min-h-12 md:px-[22px] md:py-3.5" :to="href(navigation.hire.href)">{{
					navigation.hire.label
				}}</UiButton>
				<NuxtLink
					:to="localePath(otherLocale)"
					:hreflang="otherLocale"
					:lang="otherLocale"
					class="inline-flex min-h-11 min-w-11 items-center rounded-[4px] px-2 py-3 type-mono-s text-ink-soft no-underline transition-colors duration-150 ease-(--ease) hover:text-ink max-md:hidden"
					@click="trackSwitch(otherLocale)"
					>{{ navigation.toggleLanguageLabel
					}}<span v-if="languageNames?.[otherLocale]" class="sr-only"> ({{ languageNames[otherLocale] }})</span></NuxtLink
				>
				<button
					ref="menuButton"
					type="button"
					class="grid size-11 place-items-center rounded-md text-ink transition-colors duration-150 ease-(--ease) hover:bg-surface-2 md:hidden"
					:aria-expanded="menuOpen"
					aria-controls="mobile-menu"
					:aria-label="(menuOpen ? navigation.closeMenuLabel : navigation.toggleMenuLabel) ?? undefined"
					@click="menuOpen = !menuOpen"
				>
					<svg
						v-if="menuOpen"
						class="size-[22px]"
						viewBox="0 0 22 22"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						aria-hidden="true"
					>
						<path d="M5 5L17 17M17 5L5 17" />
					</svg>
					<svg
						v-else
						class="size-[22px]"
						viewBox="0 0 22 22"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						aria-hidden="true"
					>
						<path d="M3 6H19M3 11H19M3 16H13" />
					</svg>
				</button>
			</div>
		</div>

		<!-- The panel renders in body so the sticky header's own stacking context never clips it. -->
		<Teleport to="body">
			<MobileMenu v-if="menuOpen && layout" :layout="layout" :menu-button="menuButton" @close="closeMenu()" />
		</Teleport>
		<!-- Without JavaScript the menu button does nothing, so phones get the links as a plain list instead. -->
		<nav :aria-label="navigation.navLabel ?? undefined" class="nojs-only site-container border-t border-line md:hidden">
			<ul class="flex list-none flex-wrap gap-x-6 p-0">
				<li v-for="item in items" :key="item.id ?? item.href">
					<UiLink :to="href(item.href)" :current="currentOf(item)">{{ item.label }}</UiLink>
				</li>
				<li>
					<UiLink :to="localePath(otherLocale)">{{ navigation.toggleLanguageLabel }}</UiLink>
				</li>
			</ul>
		</nav>
	</header>
</template>
