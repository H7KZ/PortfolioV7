<script setup lang="ts">
import type { LayoutData, Locale } from '#shared/types/content'

const { layout, menuButton } = defineProps<{ layout: LayoutData; menuButton: HTMLButtonElement | null }>()
const emit = defineEmits<{ close: [] }>()

const layoutRef = computed(() => layout)
const { items, currentOf, currentLocale, languageNames, localePath, trackSwitch } = useNavigation(layoutRef)
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
	<div id="mobile-menu" ref="panel" class="fixed inset-x-0 top-[73px] bottom-0 z-40 flex flex-col overflow-y-auto bg-bg px-5 pt-2 pb-8 md:hidden">
		<nav :aria-label="navigation.navLabel ?? undefined">
			<ul class="flex list-none flex-col gap-2 p-0">
				<li v-for="item in links" :key="item.id ?? item.href" class="h-16 border-b border-line">
					<NuxtLink
						:to="href(item.href)"
						:aria-current="currentOf(item)"
						class="flex h-full items-center gap-3 type-h2 no-underline"
						:class="currentOf(item) ? 'text-ink' : 'text-ink-soft'"
						@click="emit('close')"
					>
						{{ item.label }}
						<span v-if="currentOf(item)" class="type-mono-s text-accent">{{ navigation.currentLabel }}</span>
					</NuxtLink>
				</li>
			</ul>
		</nav>

		<div class="mt-auto flex flex-col items-start gap-4 pt-8">
			<div class="flex gap-2 rounded-[8px] border border-line-strong p-1">
				<NuxtLink
					v-for="code in LOCALES"
					:key="code"
					:to="localePath(code)"
					:hreflang="code"
					:lang="code"
					:aria-current="code === currentLocale ? 'true' : undefined"
					class="flex min-h-11 items-center rounded-sm px-4 type-body-s no-underline"
					:class="code === currentLocale ? 'bg-surface-2 text-ink' : 'text-mute hover:text-ink'"
					@click="switchTo(code)"
					>{{ languageNames?.[code] }}</NuxtLink
				>
			</div>
			<UiButton
				v-if="navigation.mobileMenu?.primaryCta?.href"
				block
				class="justify-start!"
				:to="href(navigation.mobileMenu.primaryCta.href)"
				@click="emit('close')"
				>{{ navigation.mobileMenu.primaryCta.label }}</UiButton
			>
			<a
				v-if="navigation.mobileMenu?.email"
				:href="`mailto:${navigation.mobileMenu.email}`"
				class="relative type-mono-s text-mute no-underline after:absolute after:inset-x-0 after:-inset-y-3 hover:text-ink"
				@click="trackLink('mailto:')"
				>{{ navigation.mobileMenu.email }}</a
			>
		</div>
	</div>
</template>
