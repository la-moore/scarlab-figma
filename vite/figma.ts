import { type Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { build } from 'esbuild'

interface OptionsI {
    name: string
    id: string
    editorType: ('figma' | 'figjam' | 'dev' | 'slides')[]
    api: string
    main: string
    documentAccess?: 'dynamic-page'
    networkAccess?: {
        allowedDomains: string[]
        reasoning?: string
        devAllowedDomains?: string[]
    }
}

/**
 * Bundles the plugin main thread with esbuild and writes manifest.json
 * next to the single-file UI produced by Vite.
 */
export function viteFigmaPlugin(options: OptionsI): Plugin {
    let root = ''
    let outDir = ''

    return {
        name: 'vite-figma',
        apply: 'build',
        configResolved(config) {
            root = config.root
            outDir = path.resolve(config.root, config.build.outDir)
        },
        async closeBundle() {
            await build({
                entryPoints: [path.join(root, options.main)],
                bundle: true,
                outfile: path.join(outDir, 'figma.js'),
                // The Figma plugin sandbox does not support the newest syntax.
                target: 'es2017',
                logLevel: 'warning'
            })

            fs.writeFileSync(
                path.join(outDir, 'manifest.json'),
                JSON.stringify({ ...options, ui: 'index.html', main: 'figma.js' }, null, '\t')
            )
        }
    }
}
