type Chip = { label: string; accent?: boolean }

export const HOME_CARDS: Record<
	string,
	{
		size: 'featured' | 'wide' | 'narrow' | 'default'
		company: string
		role: string
		descKey: string
		badgeKey?: string
		chips: string[]
		cta: 'viewProject' | 'readCaseStudy'
	}
> = {
	kreditozrouti: {
		size: 'featured',
		badgeKey: 'projectKreditozroutiBadge',
		company: 'OWN PRODUCT',
		role: 'CREATOR & MAINTAINER',
		descKey: 'projectKreditozroutiDesc',
		chips: ['Vue.js', 'Node.js', 'Redis', 'BullMQ', 'Docker', 'Traefik'],
		cta: 'readCaseStudy'
	},
	iont_info: {
		size: 'featured',
		company: 'IONT TECH',
		role: 'FULLSTACK',
		descKey: 'projectIontInfoDesc',
		chips: ['SvelteKit', 'Fastify', 'Docker Swarm', 'MongoDB', 'Raspberry Pi'],
		cta: 'readCaseStudy'
	},
	corac_sith: {
		size: 'wide',
		badgeKey: 'projectCoraSithBadge',
		company: 'CORAC ENGINEERING',
		role: 'SENIOR FRONTEND',
		descKey: 'projectCoraSithDesc',
		chips: ['Vue 3', 'D3.js', 'AWS Cognito', 'Vite', 'pnpm', 'Shadcn'],
		cta: 'readCaseStudy'
	},
	iont_charge: {
		size: 'narrow',
		company: 'IONT TECH',
		role: 'FULLSTACK',
		descKey: 'projectIontChargeDesc',
		chips: ['SvelteKit', 'Fastify', 'Docker Swarm', 'MongoDB'],
		cta: 'readCaseStudy'
	},
	corac_scorecard: {
		size: 'narrow',
		company: 'CORAC',
		role: 'FRONTEND',
		descKey: 'projectCoraScorecardDesc',
		chips: ['Vue.js', 'Shadcn UI'],
		cta: 'viewProject'
	},
	disenchantment: {
		size: 'narrow',
		company: 'PERSONAL',
		role: 'JAVA',
		descKey: 'projectDisenchantmentDesc',
		chips: ['Java', 'Spigot API'],
		cta: 'viewProject'
	},
	iont_admin: {
		size: 'narrow',
		company: 'IONT TECH',
		role: 'FULLSTACK',
		descKey: 'projectIontAdminDesc',
		chips: ['Svelte', 'Fastify', 'Raspberry Pi'],
		cta: 'viewProject'
	},
	noteful: { size: 'default', company: 'PERSONAL', role: 'DESIGN', descKey: 'projectNotefulDesc', chips: ['Figma'], cta: 'viewProject' },
	pangolin: { size: 'default', company: 'WORK', role: 'FRONTEND', descKey: 'projectPangolinDesc', chips: ['React.js', 'TailwindCSS'], cta: 'viewProject' }
}

export const SERVICE_CHIPS = [
	['Architecture', 'Full-stack', 'DevOps'],
	['Refactor', 'CI / CD', 'Docker'],
	['Mentoring', 'Code review', 'System design']
]

export const TESTIMONIALS = [
	{ key: '0', name: 'Adam Motvička', initials: 'AM' },
	{ key: '1', name: 'Petr Hric', initials: 'PH' },
	{ key: '2', name: 'Amelie Engelmaierová', initials: 'AE' },
	{ key: '3', name: 'Marek Vospěl', initials: 'MV' },
	{ key: '4', name: 'Petr Krejčí', initials: 'PK' },
	{ key: '5', name: 'Zdeněk Glazer', initials: 'ZG' }
]

export const TESTIMONIAL_LINK = 'https://www.linkedin.com/in/jan-kominek/'

export const EXPERIENCE: { key: string; kind: 'work' | 'ownProduct' | 'leadership' | 'education'; current?: boolean; highlights: number; chips: Chip[] }[] = [
	{
		key: 'exp1',
		kind: 'work',
		highlights: 3,
		chips: [{ label: 'Vue 3', accent: true }, { label: 'TypeScript' }, { label: 'D3.js' }, { label: 'AWS Cognito' }, { label: 'Vite' }, { label: 'pnpm' }]
	},
	{
		key: 'exp2',
		kind: 'work',
		highlights: 3,
		chips: [
			{ label: 'Node.js', accent: true },
			{ label: 'TypeScript' },
			{ label: 'Nuxt' },
			{ label: 'AdonisJS' },
			{ label: 'PostgreSQL' },
			{ label: 'Redis' },
			{ label: 'Elasticsearch' }
		]
	},
	{
		key: 'exp4',
		kind: 'work',
		highlights: 3,
		chips: [
			{ label: 'SvelteKit' },
			{ label: 'Fastify' },
			{ label: 'TypeScript' },
			{ label: 'Docker Swarm' },
			{ label: 'MongoDB' },
			{ label: 'Redis' },
			{ label: 'Linux' }
		]
	},
	{ key: 'exp5', kind: 'work', highlights: 0, chips: [{ label: 'React' }, { label: 'Node.js' }, { label: 'Playwright' }, { label: 'SQL' }] },
	{ key: 'exp6', kind: 'work', highlights: 0, chips: [{ label: 'Vue.js' }, { label: 'TypeScript' }, { label: 'Tailwind' }] },
	{
		key: 'prod1',
		kind: 'ownProduct',
		current: true,
		highlights: 3,
		chips: [
			{ label: 'TypeScript', accent: true },
			{ label: 'Vue.js' },
			{ label: 'Node.js' },
			{ label: 'Redis' },
			{ label: 'BullMQ' },
			{ label: 'Docker' },
			{ label: 'Traefik' },
			{ label: 'CI/CD' }
		]
	},
	{
		key: 'lead1',
		kind: 'leadership',
		highlights: 3,
		chips: [{ label: 'TypeScript' }, { label: 'Node.js' }, { label: 'Docker' }, { label: 'Traefik' }, { label: 'Redis' }, { label: 'BullMQ' }]
	},
	{ key: 'lead2', kind: 'leadership', highlights: 0, chips: [] },
	{ key: 'edu1', kind: 'education', highlights: 2, chips: [] },
	{ key: 'edu2', kind: 'education', highlights: 0, chips: [] }
]

export const SKILL_GROUPS: { key: string; skills: [string, boolean][] }[] = [
	{
		key: 'skillGroup1',
		skills: [
			['TypeScript', true],
			['Vue.js', true],
			['Node.js', true],
			['React.js', false],
			['SvelteKit', false],
			['Nuxt.js', false],
			['AdonisJS', false],
			['Fastify', false],
			['Express', false]
		]
	},
	{
		key: 'skillGroup2',
		skills: [
			['PostgreSQL', true],
			['MongoDB', true],
			['Redis', true],
			['MySQL', false],
			['Elasticsearch', false],
			['BullMQ', false],
			['REST APIs', false],
			['GraphQL', false]
		]
	},
	{
		key: 'skillGroup3',
		skills: [
			['Docker', true],
			['CI/CD', true],
			['Linux', true],
			['Docker Swarm', false],
			['Kubernetes', false],
			['DigitalOcean', false],
			['AWS (Cognito)', false],
			['Traefik', false],
			['Bash', false]
		]
	},
	{
		key: 'skillGroup4',
		skills: [
			['Git', true],
			['Figma', true],
			['Agile / Scrum', false],
			['Code Review', false],
			['System Architecture', false],
			['Mentoring', false],
			['Playwright E2E', false]
		]
	}
]

export const RESUME_IMPACT: { key: string; value: string; style: 'number' | 'text' | 'accent' }[] = [
	{ key: 'impact1', value: '2022', style: 'number' },
	{ key: 'impact2', value: '6', style: 'number' },
	{ key: 'impact3', value: 'TS + Vue + Node', style: 'text' },
	{ key: 'impact4', value: '◆ Available', style: 'accent' }
]

export const HTTP_STATUS_TITLES: Record<string, string> = {
	'300': 'Multiple Choices',
	'301': 'Moved Permanently',
	'302': 'Found',
	'307': 'Temporary Redirect',
	'308': 'Permanent Redirect',
	'400': 'Bad Request',
	'401': 'Unauthorized',
	'402': 'Payment Required',
	'403': 'Forbidden',
	'404': 'Not Found',
	'405': 'Method Not Allowed',
	'406': 'Not Acceptable',
	'407': 'Proxy Authentication Required',
	'408': 'Request Timeout',
	'409': 'Conflict',
	'410': 'Gone',
	'411': 'Length Required',
	'412': 'Precondition Failed',
	'413': 'Payload Too Large',
	'414': 'URI Too Long',
	'415': 'Unsupported Media Type',
	'416': 'Range Not Satisfiable',
	'417': 'Expectation Failed',
	'418': "I'm a Teapot",
	'421': 'Misdirected Request',
	'422': 'Unprocessable Content',
	'423': 'Locked',
	'424': 'Failed Dependency',
	'425': 'Too Early',
	'426': 'Upgrade Required',
	'428': 'Precondition Required',
	'429': 'Too Many Requests',
	'431': 'Request Header Fields Too Large',
	'451': 'Unavailable For Legal Reasons',
	'500': 'Internal Server Error',
	'501': 'Not Implemented',
	'502': 'Bad Gateway',
	'503': 'Service Unavailable',
	'504': 'Gateway Timeout',
	'505': 'HTTP Version Not Supported',
	'506': 'Variant Also Negotiates',
	'507': 'Insufficient Storage',
	'508': 'Loop Detected',
	'510': 'Not Extended',
	'511': 'Network Authentication Required'
}

export const SEO = {
	home: {
		title: 'Jan Komínek · Fullstack Engineer · Prague',
		description:
			'Jan Komínek, Fullstack Engineer in Prague. TypeScript, Vue.js, React, Node.js, PostgreSQL, Docker. Available for part-time B2B work, around 20 hours a week, hybrid in Prague or fully remote.'
	},
	resume: {
		title: 'Resumé · Jan Komínek, Fullstack Engineer, Prague',
		description:
			'CV of Jan Komínek, Fullstack Engineer in Prague. Building products from scratch since 2022. TypeScript, Vue.js, React, Node.js, PostgreSQL, Docker. Open to part-time B2B and engineering leadership.'
	},
	blog: {
		title: 'Blog · DevOps, SvelteKit & TypeScript · Jan Komínek',
		description: 'Engineering articles by Jan Komínek on Docker, Traefik, SvelteKit, TypeScript, and system architecture from real production projects.'
	},
	contact: {
		title: 'Contact · Jan Komínek, Fullstack Engineer',
		description:
			'Hire Jan Komínek, Fullstack Engineer in Prague. Available for part-time B2B work, around 20 hours a week, hybrid in Prague or fully remote. Book a 30-min call or send a project brief.'
	},
	site: {
		title: 'Jan Komínek · Fullstack Engineer, Prague',
		description:
			'Portfolio of Jan Komínek, Fullstack Engineer based in Prague. Available for part-time B2B work, around 20 hours a week, hybrid in Prague or fully remote. TypeScript, Vue.js, React, Node.js, PostgreSQL, Docker.',
		keywords: 'Jan Komínek, Fullstack Engineer, SvelteKit, Vue.js, React, TypeScript, Node.js, PostgreSQL, Docker, part-time B2B developer Prague'
	}
}

export const PERSON = {
	jobTitle: 'Fullstack Engineer',
	personDescription:
		'Fullstack Engineer based in Prague, Czech Republic. Working with TypeScript, Vue.js, React, Node.js, PostgreSQL and Docker. Since 2022 has taken products from an empty repository to production and creates and runs Kreditožrouti, a live course scheduler. Available for part-time B2B work, around 20 hours a week, hybrid in Prague or fully remote, with an eye on technical leadership. Not the Czech actor of the same name.',
	profileDescription: 'Portfolio of Jan Komínek, Fullstack Engineer based in Prague, Czech Republic. Not the Czech actor of the same name.',
	knowsAbout: [
		'Vue.js',
		'React.js',
		'TypeScript',
		'Node.js',
		'SvelteKit',
		'Docker',
		'Docker Swarm',
		'Kubernetes',
		'DevOps',
		'PostgreSQL',
		'Redis',
		'CI/CD',
		'Microservices',
		'System Architecture',
		'Team Leadership',
		'Engineering Management'
	],
	occupationSkills: 'Vue.js, React.js, SvelteKit, TypeScript, Node.js, AdonisJS, PostgreSQL, Docker, Kubernetes, DevOps',
	alumniOf: [
		{ name: 'Prague University of Economics and Business', alternateName: 'VŠE' },
		{ name: 'Smíchov Secondary Technical School and Gymnasium', alternateName: 'SSPŠ' }
	],
	offerCatalogName: 'Freelance Engineering Services',
	services: [
		'Product development from scratch, idea to production',
		'Legacy rescue and stabilisation',
		'Fractional senior engineer: architecture, code review, mentoring'
	]
}

export const GEO_SUMMARY =
	'Jan Komínek is a fullstack engineer based in Prague, Czech Republic, working with TypeScript, Vue.js, React, Node.js and PostgreSQL. Since 2022 he has taken products from an empty repository to production, most recently as sole frontend engineer on a zero-trust data provenance platform and as technical lead on an EV charging platform. He also creates and runs Kreditožrouti, a live course scheduler used by 300+ students, and mentors junior engineers with an eye on technical leadership. He is available for part-time B2B work, around 20 hours a week, hybrid in Prague or fully remote.'
