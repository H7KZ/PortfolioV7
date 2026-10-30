<script setup lang="ts">
import type { Privacy } from '@portfolio/content'

import type { Resolved, TocItem } from '#shared/types/content'

definePageMeta({ contactCta: false })

const page = await useContent<Resolved<Privacy> & { toc: TocItem[] }>('legal/privacy')

useSeo(() => ({
	title: page.value.meta?.title ?? page.value.title,
	description: page.value.meta?.description,
	image: page.value.meta?.image,
	type: 'website'
}))
</script>

<template>
	<LegalDocument :page="page">
		<AnalyticsOptOut
			:title="page.optOutTitle"
			:active-text="page.optOutActive"
			:inactive-text="page.optOutInactive"
			:opt-out-label="page.optOutButton"
			:opt-in-label="page.optInButton"
		/>
	</LegalDocument>
</template>
