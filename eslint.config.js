import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    { ignores: ['dist', 'node_modules'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        files: ['**/*.vue'],
        languageOptions: { parserOptions: { parser: tseslint.parser } }
    },
    {
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
        rules: {
            // Icons are trusted, bundled SVG markup.
            'vue/no-v-html': 'off',
            'vue/max-attributes-per-line': 'off',
            'vue/singleline-html-element-content-newline': 'off',
            'vue/html-self-closing': 'off',
            // TypeScript already checks for undefined identifiers.
            'no-undef': 'off'
        }
    }
)
