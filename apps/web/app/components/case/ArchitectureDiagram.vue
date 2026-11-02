<script setup lang="ts">
import type { Resolved } from '#shared/types/content'
import type { Project } from '@portfolio/content'

type Architecture = NonNullable<Resolved<Project>['architecture']>
type Edge = NonNullable<Architecture['edges']>[number]
type Kind = 'request' | 'sync' | 'async'

const { architecture } = defineProps<{ architecture: Architecture }>()

/** Grid cell per node key. The topology is fixed by the design; text comes from the CMS. */
const PLACEMENT: Record<string, { row: number; col: 1 | 2 | 'span' }> = {
	web: { row: 1, col: 1 },
	ai: { row: 1, col: 2 },
	traefik: { row: 2, col: 'span' },
	api: { row: 3, col: 1 },
	mcp: { row: 3, col: 2 },
	redis: { row: 4, col: 1 },
	mysql: { row: 4, col: 2 },
	scraper: { row: 5, col: 1 },
	insis: { row: 5, col: 2 }
}

/** DOM order follows a search request first, then the background refresh, then the AI path. */
const FLOW = ['web', 'traefik', 'api', 'mysql', 'redis', 'scraper', 'insis', 'ai', 'mcp']

/**
 * Where each edge leaves and enters its nodes, as a fraction of the node width. Every edge runs down the middle of
 * its column except the API to MySQL edge, which changes column and bends once at the middle of the row gap.
 */
const ANCHORS: Record<string, { from: number; to: number; labelSide: 'left' | 'right' | 'above' }> = {
	'api>redis': { from: 0.5, to: 0.5, labelSide: 'left' },
	'api>mysql': { from: 0.82, to: 0.22, labelSide: 'above' },
	'scraper>insis': { from: 0, to: 0, labelSide: 'above' }
}

/** Keeps the separator dot at the end of a line instead of the start of the next one. */
const trailDots = (text: string) => text.replaceAll(' · ', ' · ')

/** The mono font has no arrow, so the fallback's long glyph is swapped for the drawn one. */
const observability = computed(() => architecture.observability?.split('→') ?? [])

const nodes = computed(() =>
	[...(architecture.nodes ?? [])].sort((a, b) => {
		const ia = FLOW.indexOf(a.key)
		const ib = FLOW.indexOf(b.key)
		return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
	})
)

function cellStyle(key: string): Record<string, string> {
	const place = PLACEMENT[key]
	if (!place) return {}
	return { gridRow: String(place.row), gridColumn: place.col === 'span' ? '1 / -1' : String(place.col) }
}

interface DrawnEdge {
	id: string
	kind: Kind
	d: string
	bidirectional: boolean
	label: string | null
	labelX: number
	labelY: number
	labelSide: 'left' | 'right' | 'above'
}

const root = useTemplateRef<HTMLElement>('root')
const size = ref({ width: 0, height: 0 })
const drawn = ref<DrawnEdge[]>([])

function rectOf(key: string): DOMRect | null {
	return root.value?.querySelector<HTMLElement>(`[data-node="${key}"]`)?.getBoundingClientRect() ?? null
}

function layoutEdge(edge: Edge, origin: DOMRect, compact: boolean): DrawnEdge | null {
	const from = rectOf(edge.from)
	const to = rectOf(edge.to)
	if (!from || !to) return null
	const key = `${edge.from}>${edge.to}`
	const anchor = ANCHORS[key] ?? { from: 0.5, to: 0.5, labelSide: 'right' as const }
	const label = (compact ? (edge.labelShort ?? edge.label) : edge.label) ?? null
	const x = (rect: DOMRect, fraction: number) => rect.left - origin.left + rect.width * fraction
	const top = (rect: DOMRect) => rect.top - origin.top
	const bottom = (rect: DOMRect) => rect.bottom - origin.top

	// Same row: a horizontal edge from the right side of one node to the left side of the next.
	if (Math.abs(from.top - to.top) < 2) {
		const y = top(from) + from.height / 2
		const x1 = from.right - origin.left
		const x2 = to.left - origin.left
		return {
			id: edge.id ?? `${edge.from}-${edge.to}`,
			kind: edge.kind,
			d: `M ${x1} ${y} H ${x2}`,
			bidirectional: !!edge.bidirectional,
			label,
			labelX: (x1 + x2) / 2,
			labelY: y,
			labelSide: 'above'
		}
	}

	// Traefik spans both columns, so edges into or out of it attach where the other node sits.
	const fromX = edge.from === 'traefik' ? x(to, anchor.to) : x(from, anchor.from)
	const toX = edge.to === 'traefik' ? fromX : x(to, anchor.to)
	const y1 = bottom(from)
	const y2 = top(to)
	if (Math.abs(fromX - toX) < 1) {
		return {
			id: edge.id ?? `${edge.from}-${edge.to}`,
			kind: edge.kind,
			d: `M ${fromX} ${y1} V ${y2}`,
			bidirectional: !!edge.bidirectional,
			label,
			labelX: fromX,
			labelY: (y1 + y2) / 2,
			labelSide: anchor.labelSide
		}
	}
	const bend = (y1 + y2) / 2
	return {
		id: edge.id ?? `${edge.from}-${edge.to}`,
		kind: edge.kind,
		d: `M ${fromX} ${y1} V ${bend} H ${toX} V ${y2}`,
		bidirectional: !!edge.bidirectional,
		label,
		labelX: (fromX + toX) / 2,
		labelY: bend,
		labelSide: 'above'
	}
}

function measure(): void {
	if (!root.value) return
	const origin = root.value.getBoundingClientRect()
	const compact = window.matchMedia('(max-width: 767px)').matches
	size.value = { width: origin.width, height: origin.height }
	drawn.value = (architecture.edges ?? []).map(edge => layoutEdge(edge, origin, compact)).filter((edge): edge is DrawnEdge => edge !== null)
}

let observer: ResizeObserver | null = null
onMounted(() => {
	measure()
	observer = new ResizeObserver(() => measure())
	if (root.value) observer.observe(root.value)
	document.fonts?.ready.then(measure)
})
onBeforeUnmount(() => observer?.disconnect())

const STROKE: Record<Kind, { color: string; width: number; dash?: string }> = {
	request: { color: 'var(--color-accent)', width: 2 },
	sync: { color: 'var(--color-control)', width: 1.5 },
	async: { color: 'var(--color-control)', width: 1.5, dash: '5 4' }
}

function labelClass(edge: DrawnEdge): string {
	if (edge.labelSide === 'left') return '-translate-x-[calc(100%+8px)] -translate-y-1/2'
	if (edge.labelSide === 'right') return 'translate-x-2 -translate-y-1/2'
	return '-translate-x-1/2 -translate-y-[calc(100%+6px)]'
}
</script>

<template>
	<figure class="m-0 flex flex-col gap-5">
		<div class="rounded-[12px] border border-line bg-surface p-4 md:p-6 lg:p-7">
			<p v-if="architecture.textAlternative" class="sr-only">{{ architecture.textAlternative }}</p>
			<!-- Figma draws the diagram 2px wider than the padded box, so the grid is widened to the same size. Clipped so a drawing measured at the previous width never widens the page while it is redrawn. -->
			<div ref="root" class="relative -mr-0.5 overflow-hidden" aria-hidden="true">
				<ol class="relative z-[1] grid list-none grid-cols-2 gap-x-6 gap-y-14 p-0 md:gap-x-12 lg:gap-x-14">
					<li
						v-for="node in nodes"
						:key="node.key"
						:data-node="node.key"
						:style="cellStyle(node.key)"
						class="flex flex-col gap-1 rounded-[8px] border py-3 pr-[13px] pl-3.5"
						:class="node.external ? 'border-dashed border-control' : 'border-line-strong bg-surface-2'"
					>
						<span class="type-body-medium text-ink">{{ node.name }}</span>
						<span v-if="node.tech" class="type-mono-s text-mute">{{ trailDots(node.tech) }}</span>
					</li>
				</ol>
				<svg
					v-if="size.width"
					class="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
					preserveAspectRatio="none"
					:viewBox="`0 0 ${size.width} ${size.height}`"
				>
					<defs>
						<marker
							v-for="(stroke, kind) in STROKE"
							:id="`arrow-${kind}`"
							:key="kind"
							viewBox="0 0 10 10"
							refX="9"
							refY="5"
							markerWidth="10"
							markerHeight="10"
							markerUnits="userSpaceOnUse"
							orient="auto-start-reverse"
						>
							<path
								d="M 1 1 L 9 5 L 1 9"
								fill="none"
								:stroke="stroke.color"
								:stroke-width="stroke.width"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</marker>
					</defs>
					<path
						v-for="edge in drawn"
						:key="edge.id"
						:d="edge.d"
						fill="none"
						:stroke="STROKE[edge.kind].color"
						:stroke-width="STROKE[edge.kind].width"
						:stroke-dasharray="STROKE[edge.kind].dash"
						:marker-end="`url(#arrow-${edge.kind})`"
						:marker-start="edge.bidirectional ? `url(#arrow-${edge.kind})` : undefined"
					/>
				</svg>
				<span
					v-for="edge in drawn.filter(item => item.label)"
					:key="`label-${edge.id}`"
					class="pointer-events-none absolute z-[2] type-mono-label whitespace-nowrap text-faint"
					:class="labelClass(edge)"
					:style="{ left: `${edge.labelX}px`, top: `${edge.labelY}px` }"
					>{{ edge.label }}</span
				>
			</div>

			<div class="mt-6 flex flex-col gap-3 border-t border-line pt-5">
				<ul v-if="architecture.legend" class="m-0 flex list-none flex-wrap gap-x-6 gap-y-2.5 p-0 type-mono-label text-mute" aria-hidden="true">
					<li v-for="kind in ['request', 'sync', 'async'] as const" :key="kind" class="flex items-center gap-2">
						<svg width="24" height="8" viewBox="0 0 24 8">
							<line
								x1="0"
								y1="4"
								x2="24"
								y2="4"
								:stroke="STROKE[kind].color"
								:stroke-width="STROKE[kind].width"
								:stroke-dasharray="STROKE[kind].dash"
							/>
						</svg>
						{{ architecture.legend[kind] }}
					</li>
				</ul>
				<p v-if="architecture.observability" class="m-0 type-mono-label text-mute">
					<template v-for="(part, index) in observability" :key="index"><ArrowGlyph v-if="index" />{{ part }}</template>
				</p>
			</div>
		</div>
		<figcaption v-if="architecture.caption" class="max-w-[680px] type-body text-ink-soft">{{ architecture.caption }}</figcaption>
	</figure>
</template>
