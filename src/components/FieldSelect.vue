<template>
  <div ref="root" class="relative min-w-0">
    <button
      ref="trigger"
      type="button"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-label="label"
      :title="title ?? label"
      :disabled="disabled"
      class="field group flex w-full items-center gap-1 pr-0.5 pl-1.5 text-left disabled:pointer-events-none disabled:opacity-40"
      :class="{ 'field-active': open }"
      @click="toggle"
      @keydown.down.prevent="openMenu"
      @keydown.up.prevent="openMenu"
    >
      <span class="flex size-4 shrink-0 items-center justify-center text-fg-tertiary" aria-hidden="true">
        <slot name="icon" />
      </span>
      <span class="min-w-0 flex-1 truncate tabular-nums">{{ current?.label }}</span>
      <BaseChevronDown
        class="size-3 shrink-0 text-fg-tertiary opacity-0 transition-opacity group-hover:opacity-100"
        :class="{ 'opacity-100': open }"
        aria-hidden="true"
      />
    </button>

    <ul
      v-if="open"
      ref="menu"
      role="listbox"
      tabindex="-1"
      :aria-label="label"
      :aria-activedescendant="`${id}-${active}`"
      class="menu absolute top-full left-0 z-20 mt-1 max-h-64 min-w-full overflow-y-auto rounded-xl p-2 focus:outline-none"
      @keydown.down.prevent="move(1)"
      @keydown.up.prevent="move(-1)"
      @keydown.home.prevent="active = 0"
      @keydown.end.prevent="active = options.length - 1"
      @keydown.enter.prevent="select(active)"
      @keydown.space.prevent="select(active)"
      @keydown.esc.prevent.stop="close(true)"
      @keydown.tab="close(false)"
    >
      <li
        v-for="(option, index) in options"
        :id="`${id}-${index}`"
        :key="String(option.value)"
        role="option"
        :aria-selected="option.value === modelValue"
        class="menu-item flex h-6 cursor-default items-center gap-1 rounded-[5px] pr-4 pl-1 whitespace-nowrap tabular-nums"
        :class="{ 'menu-item-active': index === active }"
        @pointerenter="active = index"
        @click="select(index)"
      >
        <span class="flex size-4 items-center justify-center">
          <BaseCheckLg v-if="option.value === modelValue" class="size-3" stroke-width="2.5" aria-hidden="true" />
        </span>
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number">
import { computed, nextTick, onBeforeUnmount, ref, useId } from 'vue'
import { BaseCheckLg, BaseChevronDown } from '@scarlab-icons/vue/base'

const props = defineProps<{
  modelValue: T
  options: { value: T, label: string }[]
  label: string
  title?: string
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: T] }>()

const id = useId()
const open = ref(false)
const active = ref(0)
const root = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const menu = ref<HTMLElement>()

const current = computed(() => props.options.find((option) => option.value === props.modelValue))

function onOutside(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) {
    close(false)
  }
}

async function openMenu() {
  if (open.value) return

  open.value = true
  active.value = Math.max(0, props.options.findIndex((option) => option.value === props.modelValue))
  document.addEventListener('pointerdown', onOutside)

  await nextTick()
  menu.value?.focus()
  menu.value?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
}

function close(restoreFocus: boolean) {
  if (!open.value) return

  open.value = false
  document.removeEventListener('pointerdown', onOutside)

  if (restoreFocus) trigger.value?.focus()
}

function toggle() {
  if (open.value) close(true)
  else openMenu()
}

function move(step: number) {
  const count = props.options.length
  active.value = (active.value + step + count) % count
  menu.value?.querySelector(`#${CSS.escape(`${id}-${active.value}`)}`)?.scrollIntoView({ block: 'nearest' })
}

function select(index: number) {
  const option = props.options[index]

  if (option) emit('update:modelValue', option.value)
  close(true)
}

onBeforeUnmount(() => document.removeEventListener('pointerdown', onOutside))
</script>
