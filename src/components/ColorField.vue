<template>
  <div class="field flex min-w-0 items-center gap-1.5 pr-1.5 pl-1" :class="{ 'field-active': focused }">
    <label
      class="relative size-4 shrink-0 cursor-pointer overflow-hidden rounded-[3px] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]"
      :style="{ backgroundColor: color }"
      title="Pick color"
    >
      <span class="sr-only">Pick color</span>
      <input
        v-model="color"
        type="color"
        class="absolute inset-0 size-full cursor-pointer opacity-0"
      >
    </label>
    <input
      v-model="draft"
      type="text"
      aria-label="Hex color"
      spellcheck="false"
      maxlength="7"
      class="min-w-0 flex-1 bg-transparent uppercase tabular-nums text-fg focus:outline-none"
      @focus="onFocus"
      @blur="commit"
      @keydown.enter="($event.target as HTMLInputElement).blur()"
      @keydown.esc="cancel"
    >
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const color = defineModel<string>({ required: true })

const focused = ref(false)
const draft = ref(toDraft(color.value))

watch(color, (value) => {
  draft.value = toDraft(value)
})

function toDraft(value: string) {
  return value.replace(/^#/, '').toUpperCase()
}

/** Accepts `RGB` and `RRGGBB`, with or without a leading `#`. */
function parse(value: string) {
  const hex = value.trim().replace(/^#/, '').toLowerCase()

  if (/^[0-9a-f]{3}$/.test(hex)) {
    return `#${[...hex].map((char) => char + char).join('')}`
  }

  return /^[0-9a-f]{6}$/.test(hex) ? `#${hex}` : null
}

function onFocus(event: FocusEvent) {
  focused.value = true
  ;(event.target as HTMLInputElement).select()
}

function commit() {
  focused.value = false
  const parsed = parse(draft.value)

  if (parsed) color.value = parsed
  draft.value = toDraft(color.value)
}

function cancel(event: KeyboardEvent) {
  draft.value = toDraft(color.value)
  ;(event.target as HTMLInputElement).blur()
}
</script>
