import react from '@vitejs/plugin-react'
import fs from 'fs'
import Handlebars from 'handlebars'
import path from 'path'
import { defineConfig } from 'vite'

const { version, homepage } = JSON.parse(
	fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'),
)

const { short_name, name, theme_color, background_color } = JSON.parse(
	fs.readFileSync(path.join(process.cwd(), 'public', 'manifest.json'), 'utf-8'),
)

process.env.PUBLIC_VERSION = process.env.PUBLIC_VERSION ?? version ?? Date.now()
process.env.PUBLIC_HOMEPAGE = process.env.PUBLIC_HOMEPAGE ?? homepage
process.env.PUBLIC_MANIFEST_SHORT_NAME = short_name
process.env.PUBLIC_MANIFEST_NAME = name
process.env.PUBLIC_MANIFEST_THEME_COLOR = theme_color
process.env.PUBLIC_MANIFEST_BACKGROUND_COLOR = background_color
process.env.PUBLIC_AWS_REGION =
	process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? 'us-east-2'

const replaceInIndex = (data: Record<string, string>) => ({
	name: 'replace-in-index',
	transformIndexHtml: (source: string): string => {
		const template = Handlebars.compile(source)
		return template(data)
	},
})

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		replaceInIndex({
			name,
			shortName: short_name,
			themeColor: theme_color,
			version,
		}),
	],
	base: `${(process.env.BASE_URL ?? '').replace(/\/+$/, '')}/`,
	preview: {
		host: 'localhost',
		port: 8080,
	},
	server: {
		host: 'localhost',
		port: 8080,
	},
	resolve: {
		alias: [
			{ find: 'api/', replacement: '/src/api/' },
			{ find: 'app/', replacement: '/src/app/' },
			{ find: 'asset/', replacement: '/src/asset/' },
			{ find: 'hooks/', replacement: '/src/hooks/' },
			{ find: 'components/', replacement: '/src/components/' },
			{ find: 'utils/', replacement: '/src/utils/' },
			// https://ui.docs.amplify.aws/getting-started/installation?platform=vue#vite
			{
				find: './runtimeConfig',
				replacement: './runtimeConfig.browser',
			},
		],
	},
	build: {
		outDir: './build',
	},
	envPrefix: 'PUBLIC_',
})
