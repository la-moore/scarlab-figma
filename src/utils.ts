import type { Node as IconNode } from '@scarlab-icons/icons'
import type { InsertPayload, Settings, UiMessage } from './messages'

interface SvgElement {
    name: string
    attributes: Record<string, string>
    children: SvgElement[]
}

function escapeAttr(value: string) {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function attrsToString(attrs: Record<string, string>) {
    return Object.entries(attrs)
        .map(([key, value]) => `${key}="${escapeAttr(value)}"`)
        .join(' ')
}

function elementToString(el: SvgElement): string {
    return `<${el.name} ${attrsToString(el.attributes)}>${el.children.map(elementToString).join('')}</${el.name}>`
}

export function isStroked(icon: IconNode) {
    return 'stroke-width' in icon.svg.attributes
}

export function toSvg(icon: IconNode, attrs: Record<string, string> = {}) {
    const root = icon.svg as SvgElement

    return elementToString({ ...root, attributes: { ...root.attributes, ...attrs } })
}

export function toInsertPayload(icon: IconNode, settings: Settings): InsertPayload {
    const size = String(settings.size)
    const attrs: Record<string, string> = { width: size, height: size }

    if (isStroked(icon)) {
        attrs['stroke-width'] = String(settings.strokeWidth)
    }

    return {
        name: `${icon.style}/${icon.name}`,
        svg: toSvg(icon, attrs).replace(/currentColor/g, settings.color)
    }
}

/** Every whitespace/hyphen separated term of the query must be part of the name. */
export function matchesQuery(name: string, terms: string[]) {
    return terms.every((term) => name.includes(term))
}

export function toTerms(query: string) {
    return query.toLowerCase().split(/[\s\-_]+/).filter(Boolean)
}

export function postToPlugin(message: UiMessage) {
    window.parent.postMessage({ pluginMessage: message }, '*')
}
