<template>
  <div class="relative flex h-full flex-col">
    <header class="space-y-2 border-b border-line p-2">
      <div class="relative flex items-center">
        <OutlineSearch
          class="pointer-events-none absolute left-2 size-4 text-fg-tertiary"
          aria-hidden="true"
        />
        <input
          ref="input"
          v-model="query"
          type="search"
          aria-label="Search icons"
          placeholder="Search icons…"
          class="h-8 w-full appearance-none rounded-md border border-transparent bg-bg-secondary pr-8 pl-8 text-fg placeholder:text-fg-tertiary focus:border-line-selected focus:bg-bg focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          @keydown.enter="insertFirst"
          @keydown.esc="query = ''"
        >
        <button
          v-if="query"
          type="button"
          aria-label="Clear search"
          class="absolute right-1 flex size-6 items-center justify-center rounded-sm text-fg-secondary hover:bg-bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-line-selected"
          @click="clear"
        >
          <BaseX class="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <SegmentedControl
        v-model="settings.style"
        label="Icon style"
        :options="styleOptions"
      />

      <InsertSettings
        v-model="settings"
        :stroke-enabled="settings.style !== 'solid'"
      />
    </header>

    <main class="min-h-0 flex-1 overflow-y-auto">
      <IconGrid
        v-if="filtered.length"
        :icons="filtered"
        :stroke-width="settings.strokeWidth"
        @insert="insert"
        @drop="drop"
        @hover="hovered = $event"
      />
      <div
        v-else
        class="flex h-full flex-col items-center justify-center gap-1 p-6 text-center text-fg-secondary"
      >
        <p class="font-medium text-fg">
          No icons for “{{ query }}”
        </p>
        <p v-if="otherMatches">
          Found {{ otherMatches }} in other styles
        </p>
      </div>
    </main>

    <footer class="flex h-8 items-center gap-3 border-t border-line pr-4 pl-3 text-fg-secondary">
      <span class="min-w-0 flex-1 truncate">
        <template v-if="hovered">
          <span class="text-fg">{{ hovered.name }}</span> · click or drag
        </template>
        <template v-else>
          {{ filtered.length }} icons · v{{ version }}
        </template>
      </span>
      <a
        v-for="link in LINKS"
        :key="link.href"
        :href="link.href"
        target="_blank"
        rel="noopener"
        class="hover:text-fg-brand"
      >{{ link.label }}</a>
    </footer>

    <ResizeHandle />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { BaseX } from '@scarlab-icons/vue/base'
import { OutlineSearch } from '@scarlab-icons/vue/outline'
import { icons, type Node as IconNode } from '@scarlab-icons/icons'
import IconGrid from './components/IconGrid.vue'
import InsertSettings from './components/InsertSettings.vue'
import ResizeHandle from './components/ResizeHandle.vue'
import SegmentedControl from './components/SegmentedControl.vue'
import { DEFAULT_SETTINGS, type IconStyle, type PluginMessage, type Settings } from './messages'
import { matchesQuery, postToPlugin, toInsertPayload, toTerms } from './utils'

const STYLES: { value: IconStyle, label: string }[] = [
  { value: 'base', label: 'Base' },
  { value: 'outline', label: 'Outline' },
  { value: 'solid', label: 'Solid' },
  { value: 'ghost', label: 'Ghost' }
]

const LINKS = [
  { label: 'Web', href: 'https://scarlab-icons.la-moore.ru/' },
  { label: 'GitHub', href: 'https://github.com/la-moore/scarlab-icons' }
]

const version = __ICONS_VERSION__
const query = ref('')
const input = ref<HTMLInputElement>()
const hovered = ref<IconNode | null>(null)
const settings = ref<Settings>({ ...DEFAULT_SETTINGS })
let settingsLoaded = false

const terms = computed(() => toTerms(query.value))

const matchesByStyle = computed(() => {
  const result = Object.fromEntries(STYLES.map(({ value }) => [value, [] as IconNode[]])) as Record<IconStyle, IconNode[]>

  for (const icon of icons) {
    if (matchesQuery(icon.name, terms.value)) {
      result[icon.style as IconStyle]?.push(icon)
    }
  }

  return result
})

const filtered = computed(() => matchesByStyle.value[settings.value.style])

const otherMatches = computed(() => STYLES.reduce((sum, { value }) => sum + matchesByStyle.value[value].length, 0))

const styleOptions = computed(() => STYLES.map((style) => ({
  ...style,
  count: query.value ? matchesByStyle.value[style.value].length : undefined
})))

function insert(icon: IconNode) {
  postToPlugin({ type: 'insert', icon: toInsertPayload(icon, settings.value) })
}

function insertFirst() {
  if (filtered.value[0]) insert(filtered.value[0])
}

function drop(icon: IconNode, event: DragEvent) {
  // A drag that ends inside the plugin window is a cancelled drop.
  if (event.clientX >= 0 && event.clientX <= window.innerWidth && event.clientY >= 0 && event.clientY <= window.innerHeight) {
    return
  }

  window.parent.postMessage({
    pluginDrop: {
      clientX: event.clientX,
      clientY: event.clientY,
      items: [],
      dropMetadata: toInsertPayload(icon, settings.value)
    }
  }, '*')
}

function clear() {
  query.value = ''
  input.value?.focus()
}

watch(settings, (value) => {
  if (settingsLoaded) {
    postToPlugin({ type: 'save-settings', settings: { ...value } })
  }
}, { deep: true })

window.addEventListener('message', (event: MessageEvent<{ pluginMessage?: PluginMessage }>) => {
  const message = event.data?.pluginMessage

  if (message?.type === 'settings') {
    settings.value = { ...DEFAULT_SETTINGS, ...message.settings }
    settingsLoaded = true
  }
})

onMounted(() => {
  input.value?.focus()
  postToPlugin({ type: 'ready' })
})
</script>
