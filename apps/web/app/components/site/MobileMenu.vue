<script setup lang="ts">
import type { LayoutData, Locale } from '#shared/types/content'

const { layout, menuButton } = defineProps<{ layout: LayoutData; menuButton: HTMLButtonElement | null }>()
const emit = defineEmits<{ close: [] }>()

const layoutRef = computed(() => layout)
const { items, isActive, currentLocale, languageNames, localePath, trackSwitch } = useNavigation(layoutRef)
const href = useHref()
const { trackLink } = useAnalytics()

const navigation = computed(() => layout.navigation)
const links = computed(() => [...items.value, ...(navigation.value.mobileMenu?.extraItems ?? []).map(item => ({ ...item, match: 'exact' as const }))])
const LOCALES: Locale[] = ['en', 'cs']

const panel = useTemplateRef<HTMLElement>('panel')

function focusables(): HTMLElement[] {
	const inside = Array.from(panel.value?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])
	return menuButton ? [menuButton, ...inside] : inside
}

/** Keeps Tab inside the menu button and the panel. The panel renders in body, away from the button, so focus moves by list, not by DOM order. */
function onKeydown(event: KeyboardEvent): void {
	if (event.key === 'Escape') {
		event.preventDefault()
		emit('close')
		return
	}
	if (event.key !== 'Tab') return
	const list = focusables()
	if (list.length === 0) return
	event.preventDefault()
	const index = list.indexOf(document.activeElement as HTMLElement)
	const next = event.shiftKey ? (index <= 0 ? list.length - 1 : index - 1) : (index + 1) % list.length
	list[next]?.focus()
}

function setBackground(open: boolean): void {
	for (const element of document.querySelectorAll<HTMLElement>('[data-menu-inert]')) element.inert = open
	document.documentElement.style.overflow = open ? 'hidden' : ''
}

function switchTo(code: Locale): void {
	if (code !== currentLocale.value) trackSwitch(code)
}

onMounted(() => {
	setBackground(true)
	document.addEventListener('keydown', onKeydown)
	panel.value?.querySelector<HTMLElement>('a[href]')?.focus()
})

onBeforeUnmount(() => {
	setBackground(false)
	document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
	<div id="mobile-menu" ref="panel" class="fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col overflow-y-auto bg-bg md:hidden">
		<nav :aria-label="navigation.navLabel ?? undefined" class="site-container pt-4">
			<ul class="flex list-none flex-col p-0">
				<li v-for="item in links" :key="item.id ?? item.href" class="border-b border-line">
					<NuxtLink
						:to="href(item.href)"
						:aria-current="isActive(item) ? 'page' : undefined"
						class="flex min-h-16 items-center justify-between gap-4 type-h2 no-underline"
						:class="isActive(item) ? 'text-ink' : 'text-ink-soft'"
						@click="emit('close')"
					>
						{{ item.label }}
						<span v-if="isActive(item)" class="type-mono-label text-accent">{{ navigation.currentLabel }}</span>
					</NuxtLink>
				</li>
			</ul>
		</nav>

		<div class="site-container mt-auto flex flex-col gap-6 pt-10 pb-8">
			<div class="grid grid-cols-2 gap-1 rounded-md border border-line p-1">
				<NuxtLink
					v-for="code in LOCALES"
					:key="code"
					:to="localePath(code)"
					:hreflang="code"
					:lang="code"
					:aria-current="code === currentLocale ? 'true' : undefined"
					class="flex min-h-11 items-center justify-center rounded-sm type-button no-underline"
					:class="code === currentLocale ? 'bg-surface-2 text-ink' : 'text-ink-soft hover:text-ink'"
					@click="switchTo(code)"
					>{{ languageNames?.[code] }}</NuxtLink
				>
			</div>
			<UiButton v-if="navigation.mobileMenu?.primaryCta?.href" block :to="href(navigation.mobileMenu.primaryCta.href)" @click="emit('close')">{{
				navigation.mobileMenu.primaryCta.label
			}}</UiButton>
			<a
				v-if="navigation.mobileMenu?.email"
				:href="`mailto:${navigation.mobileMenu.email}`"
				class="inline-flex min-h-11 items-center justify-center type-mono-s text-ink-soft no-underline hover:text-ink"
				@click="trackLink('mailto:')"
				>{{ navigation.mobileMenu.email }}</a
			>
		</div>
	</div>
</template>
