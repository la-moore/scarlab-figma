<template>
  <div class="grid grid-cols-[1fr_1fr_1.35fr] gap-2">
    <FieldSelect
      v-model="settings.size"
      label="Icon size"
      :options="SIZES"
    >
      <template #icon>
        <BaseMaximize class="size-3" stroke-width="1.75" />
      </template>
    </FieldSelect>

    <FieldSelect
      v-model="settings.strokeWidth"
      label="Stroke width"
      :title="strokeEnabled ? 'Stroke width' : 'Solid icons have no stroke'"
      :options="STROKES"
      :disabled="!strokeEnabled"
    >
      <template #icon>
        <svg viewBox="0 0 16 16" class="size-3.5" fill="currentColor">
          <rect x="2" y="3" width="12" height="1" rx=".5" />
          <rect x="2" y="7" width="12" height="2" rx="1" />
          <rect x="2" y="11.5" width="12" height="3" rx="1.5" />
        </svg>
      </template>
    </FieldSelect>

    <ColorField v-model="settings.color" />
  </div>
</template>

<script setup lang="ts">
import { BaseMaximize } from '@scarlab-icons/vue/base'
import type { Settings } from '../messages'
import ColorField from './ColorField.vue'
import FieldSelect from './FieldSelect.vue'

defineProps<{ strokeEnabled: boolean }>()

const settings = defineModel<Settings>({ required: true })

const SIZES = [12, 16, 20, 24, 32, 40, 48, 64].map((value) => ({ value, label: `${value}px` }))
const STROKES = [1, 1.25, 1.5, 1.75, 2, 2.5].map((value) => ({ value, label: String(value) }))
</script>
