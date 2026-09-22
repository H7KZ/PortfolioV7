import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withPayload } from '@payloadcms/next/withPayload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: process.env.BUILD_STANDALONE === '1' ? 'standalone' : undefined,
	outputFileTracingRoot: path.join(dirname, '../../'),
	agentRules: false,
	async redirects() {
		return [{ source: '/', destination: '/admin', permanent: false }]
	}
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
