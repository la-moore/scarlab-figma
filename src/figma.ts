import {
    DEFAULT_WINDOW_SIZE,
    MIN_WINDOW_SIZE,
    type InsertPayload,
    type PluginMessage,
    type UiMessage,
    type WindowSize
} from './messages'

const STORAGE_SETTINGS = 'settings'
const STORAGE_WINDOW_SIZE = 'window-size'

type Container = FrameNode | ComponentNode | GroupNode | SectionNode

function post(message: PluginMessage) {
    figma.ui.postMessage(message)
}

function clampSize(size: WindowSize): WindowSize {
    return {
        width: Math.max(MIN_WINDOW_SIZE.width, Math.round(size.width)),
        height: Math.max(MIN_WINDOW_SIZE.height, Math.round(size.height))
    }
}

function isContainer(node: SceneNode | undefined): node is Container {
    return !!node && ['FRAME', 'COMPONENT', 'GROUP', 'SECTION'].includes(node.type)
}

function createIcon({ svg, name }: InsertPayload): FrameNode {
    const frame = figma.createNodeFromSvg(svg)

    frame.name = name

    for (const child of frame.children) {
        if ('constraints' in child) {
            child.constraints = { horizontal: 'SCALE', vertical: 'SCALE' }
        }
    }

    return frame
}

function insertIcon(payload: InsertPayload) {
    const frame = createIcon(payload)
    const selection = figma.currentPage.selection.length === 1 ? figma.currentPage.selection[0] : undefined

    if (isContainer(selection)) {
        if (selection.type === 'GROUP') {
            // Group children use the coordinate space of the group's parent.
            frame.x = selection.x + (selection.width - frame.width) / 2
            frame.y = selection.y + (selection.height - frame.height) / 2
        } else {
            frame.x = (selection.width - frame.width) / 2
            frame.y = (selection.height - frame.height) / 2
        }

        selection.appendChild(frame)
    } else {
        const { bounds } = figma.viewport

        frame.x = bounds.x + (bounds.width - frame.width) / 2
        frame.y = bounds.y + (bounds.height - frame.height) / 2
    }

    figma.currentPage.selection = [frame]
}

figma.on('drop', (event) => {
    const payload = event.dropMetadata as InsertPayload | undefined

    if (!payload?.svg) {
        return true
    }

    // createNodeFromSvg already places the icon on the current page. Dropping on the
    // empty canvas gives a PageNode in event.node, which can't be used with dynamic-page access.
    const frame = createIcon(payload)
    const target = event.node

    if (target.type !== 'PAGE' && target.type !== 'DOCUMENT' && isContainer(target)) {
        target.appendChild(frame)
    }

    frame.x = event.x - frame.width / 2
    frame.y = event.y - frame.height / 2
    figma.currentPage.selection = [frame]

    return false
})

figma.ui.onmessage = async (message: UiMessage) => {
    switch (message.type) {
        case 'ready': {
            const settings = await figma.clientStorage.getAsync(STORAGE_SETTINGS)
            post({ type: 'settings', settings: settings ?? null })
            break
        }
        case 'insert':
            insertIcon(message.icon)
            break
        case 'save-settings':
            await figma.clientStorage.setAsync(STORAGE_SETTINGS, message.settings)
            break
        case 'resize': {
            const size = clampSize(message.size)
            figma.ui.resize(size.width, size.height)

            if (message.persist) {
                await figma.clientStorage.setAsync(STORAGE_WINDOW_SIZE, size)
            }
            break
        }
    }
}

async function start() {
    const saved: WindowSize | undefined = await figma.clientStorage.getAsync(STORAGE_WINDOW_SIZE)
    const size = clampSize(saved ?? DEFAULT_WINDOW_SIZE)

    figma.showUI(__html__, { ...size, themeColors: true, title: 'Scarlab Icons' })
}

start()
