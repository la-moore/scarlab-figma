import fs from 'node:fs'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { viteFigmaPlugin } from './vite/figma.ts'
import { viteSingleFile } from 'vite-plugin-singlefile'
import tailwindcss from '@tailwindcss/vite'

const iconsPackage = JSON.parse(
    fs.readFileSync(new URL('./node_modules/@scarlab-icons/icons/package.json', import.meta.url), 'utf-8')
)

export default defineConfig({
    define: {
        __ICONS_VERSION__: JSON.stringify(iconsPackage.version)
    },
    plugins: [
        vue(),
        tailwindcss(),
        viteSingleFile(),
        viteFigmaPlugin({
            name: 'Scarlab Icons',
            id: '1053846082213772972',
            editorType: ['figma'],
            api: '1.0.0',
            main: 'src/figma.ts',
            documentAccess: 'dynamic-page',
            networkAccess: {
                allowedDomains: ['none']
            }
        })
    ]
})
