<script setup lang="ts">
import type { Term } from '@portfolio/content'

import type { Resolved } from '#shared/types/content'

definePageMeta({ contactCta: false })

const page = await useContent<Resolved<Term>>('legal/terms')

useSeo(() => ({
	title: page.value.meta?.title ?? page.value.title,
	description: page.value.meta?.description,
	image: page.value.meta?.image,
	type: 'website'
}))
</script>

<template>
	<LegalDocument :page="page" />
</template>
