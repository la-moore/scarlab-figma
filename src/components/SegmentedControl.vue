<template>
  <div
    class="flex rounded-md bg-bg-secondary p-0.5"
    role="tablist"
    :aria-label="label"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="tab"
      :aria-selected="option.value === modelValue"
      class="flex flex-1 items-center justify-center gap-1 rounded-[5px] px-1.5 py-1 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-line-selected"
      :class="option.value === modelValue
        ? 'bg-bg text-fg shadow-sm'
        : 'text-fg-secondary hover:text-fg'"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
      <span
        v-if="option.count !== undefined"
        class="tabular-nums text-fg-tertiary"
      >{{ option.count }}</span>
    </button>
  </div>
</template>

<script setup lang="ts" generic="T extends string">
defineProps<{
  modelValue: T
  label: string
  options: { value: T, label: string, count?: number }[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: T] }>()
</script>
