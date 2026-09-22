<script setup lang="ts">
const { data: layout } = await useLayoutContent()
const absoluteUrl = useAbsoluteUrl()
const { public: config } = useRuntimeConfig()
const localeHead = useLocaleHead()
const href = useHref()
const preview = useState<boolean>('preview')
const route = useRoute()

const site = computed(() => layout.value?.site)

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
		script: s
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
	<div>
		<a
			href="#main-content"
			class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-black"
		>
			{{ site?.skipToContent }}
		</a>

		<div class="grid-bg"></div>

		<div class="relative z-[1] flex h-full min-h-screen w-full flex-col">
			<header>
				<Navbar />
			</header>
			<main id="main-content" class="flex-1">
				<slot />
			</main>
			<footer v-if="layout" class="mono flex justify-center gap-4 pb-8 text-[11px] tracking-[0.04em] text-(--fg-5)">
				<NuxtLink :to="href('/privacy')" class="no-underline transition-colors duration-150 hover:text-(--fg-3)">{{
					layout.footer.privacyLabel
				}}</NuxtLink>
				<span>·</span>
				<NuxtLink :to="href('/terms')" class="no-underline transition-colors duration-150 hover:text-(--fg-3)">{{ layout.footer.termsLabel }}</NuxtLink>
			</footer>
		</div>

		<a
			v-if="preview"
			:href="`/_preview/exit?path=${encodeURIComponent(route.fullPath)}`"
			class="mono fixed right-5 bottom-5 z-[9999] rounded-full border border-(--accent-ring) bg-(--bg-2) px-4 py-2 text-[11px] tracking-widest text-(--accent) uppercase no-underline"
			>◆ Preview · exit</a
		>
	</div>
</template>
