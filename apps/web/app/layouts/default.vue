<script setup lang="ts">
const { contactCta = true } = defineProps<{ contactCta?: boolean }>()

const { data: layout } = await useLayoutContent()
const absoluteUrl = useAbsoluteUrl()
const { public: config } = useRuntimeConfig()
const localeHead = useLocaleHead()
const preview = useState<boolean>('preview')
const route = useRoute()

const site = computed(() => layout.value?.site)
const showContactCta = computed(() => contactCta && route.meta.contactCta !== false)
// SPEC 11: the Person profile belongs to the pages about Jan, not to every case study and post.
const barePath = computed(() => route.path.replace(/^\/cs(?=\/|$)/, '') || '/')
// Figma's desktop frames of posts and legal pages have no glow; their tablet and phone frames do.
const flatOnDesktop = computed(() => barePath.value.startsWith('/blog/') || ['/privacy', '/terms'].includes(barePath.value))
const isProfilePage = computed(() => ['/', '/resume'].includes(barePath.value))

useHead(() => {
	const s = site.value
	const robots = config.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'
	const image = s ? mediaUrl(s.image) : null
	return {
		htmlAttrs: { lang: localeHead.value.htmlAttrs.lang },
		link: localeHead.value.link,
		meta: [
			...localeHead.value.meta,
			{ key: 'robots', name: 'robots', content: robots },
			{ key: 'googlebot', name: 'googlebot', content: robots },
			{ key: 'author', name: 'author', content: s?.name },
			{ key: 'keywords', name: 'keywords', content: s?.keywords ?? undefined },
			{ key: 'og:site_name', property: 'og:site_name', content: s?.name },
			...(image ? [{ key: 'og:image', property: 'og:image', content: absoluteUrl(image) }] : [])
		],
		script:
			s && isProfilePage.value
				? [
						{
							key: 'ld-profile',
							type: 'application/ld+json',
							innerHTML: JSON.stringify({
								'@context': 'https://schema.org',
								'@type': 'ProfilePage',
								'@id': `${s.siteUrl}/#profilepage`,
								url: s.siteUrl,
								name: `${s.name} · ${s.jobTitle}`,
								description: s.profileDescription ?? undefined,
								mainEntity: {
									'@type': 'Person',
									'@id': `${s.siteUrl}/#person`,
									name: s.name,
									alternateName: s.alternateName ?? undefined,
									jobTitle: s.jobTitle,
									description: s.personDescription,
									image: mediaUrl(s.portrait) ? absoluteUrl(mediaUrl(s.portrait)!) : undefined,
									email: s.email,
									url: s.siteUrl,
									sameAs: s.sameAs ?? [],
									address: { '@type': 'PostalAddress', addressLocality: s.locality ?? undefined, addressCountry: s.country ?? undefined },
									alumniOf: (s.alumniOf ?? []).map(school => ({
										'@type': 'EducationalOrganization',
										name: school.name,
										alternateName: school.alternateName ?? undefined
									})),
									hasOccupation: s.occupationSkills
										? {
												'@type': 'Occupation',
												name: 'Software Engineer',
												occupationLocation: { '@type': 'City', name: s.locality ?? undefined },
												skills: s.occupationSkills
											}
										: undefined,
									knowsAbout: s.knowsAbout ?? [],
									hasOfferCatalog: s.services?.length
										? {
												'@type': 'OfferCatalog',
												name: s.offerCatalogName ?? undefined,
												itemListElement: s.services.map(service => ({
													'@type': 'Offer',
													itemOffered: { '@type': 'Service', name: service.name }
												}))
											}
										: undefined
								}
							})
						}
					]
				: []
	}
})
</script>

<template>
	<div class="relative isolate flex min-h-screen flex-col">
		<a
			href="#main"
			class="sr-only z-50 rounded-md bg-accent px-4 py-3 type-button text-accent-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
			>{{ site?.skipToContent }}</a
		>

		<div class="page-backdrop" :class="{ 'page-backdrop--home': barePath === '/', 'page-backdrop--flat-lg': flatOnDesktop }" aria-hidden="true"></div>

		<SiteNav />
		<main id="main" class="relative z-[1] flex-1" tabindex="-1" data-menu-inert>
			<slot />
		</main>
		<div class="relative z-[1]" data-menu-inert>
			<ContactCta v-if="showContactCta" />
			<SiteFooter />
		</div>

		<a
			v-if="preview"
			:href="`/_preview/exit?path=${encodeURIComponent(route.fullPath)}`"
			class="fixed right-5 bottom-5 z-50 rounded-full border border-accent bg-surface px-4 py-2 type-mono-label text-accent no-underline"
			>Preview · exit</a
		>
	</div>
</template>
