export type IconStyle = 'base' | 'outline' | 'solid' | 'ghost'

export interface Settings {
    style: IconStyle
    size: number
    color: string
    strokeWidth: number
}

export interface WindowSize {
    width: number
    height: number
}

export interface InsertPayload {
    svg: string
    name: string
}

/** Messages sent from the UI iframe to the plugin main thread. */
export type UiMessage =
    | { type: 'ready' }
    | { type: 'insert', icon: InsertPayload }
    | { type: 'save-settings', settings: Settings }
    | { type: 'resize', size: WindowSize, persist: boolean }

/** Messages sent from the plugin main thread to the UI iframe. */
export type PluginMessage =
    | { type: 'settings', settings: Partial<Settings> | null }

export const DEFAULT_SETTINGS: Settings = {
    style: 'outline',
    size: 24,
    color: '#000000',
    strokeWidth: 2
}

export const DEFAULT_WINDOW_SIZE: WindowSize = { width: 300, height: 540 }
export const MIN_WINDOW_SIZE: WindowSize = { width: 240, height: 320 }
