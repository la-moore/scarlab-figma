<template>
  <div
    class="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] p-1"
    :style="{ '--preview-stroke': strokeWidth }"
  >
    <button
      v-for="icon in visible"
      :key="icon.name"
      type="button"
      draggable="true"
      class="icon-cell flex aspect-square cursor-grab items-center justify-center rounded-md text-fg hover:bg-bg-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-line-selected active:cursor-grabbing"
      :title="icon.name"
      :aria-label="`Insert ${icon.name}`"
      @click="emit('insert', icon)"
      @dragstart="onDragStart($event, icon)"
      @dragend="emit('drop', icon, $event)"
      @mouseenter="emit('hover', icon)"
      @focus="emit('hover', icon)"
      @mouseleave="emit('hover', null)"
      @blur="emit('hover', null)"
      v-html="icon.content"
    />
    <div
      v-if="visible.length < icons.length"
      ref="sentinel"
      class="col-span-full h-10"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { Node as IconNode } from '@scarlab-icons/icons'

const PAGE = 120

const props = defineProps<{ icons: IconNode[], strokeWidth: number }>()

const emit = defineEmits<{
  insert: [icon: IconNode]
  drop: [icon: IconNode, event: DragEvent]
  hover: [icon: IconNode | null]
}>()

const limit = ref(PAGE)
const visible = computed(() => props.icons.slice(0, limit.value))
const sentinel = ref<HTMLElement>()

// Rendering is incremental: more icons are added when the sentinel scrolls into view.
const observer = new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting)) {
    limit.value += PAGE
  }
}, { rootMargin: '200px' })

watch(sentinel, (el, prev) => {
  if (prev) observer.unobserve(prev)
  if (el) observer.observe(el)
})

watch(() => props.icons, () => {
  limit.value = PAGE
})

onBeforeUnmount(() => observer.disconnect())

function onDragStart(event: DragEvent, icon: IconNode) {
  event.dataTransfer?.setData('text/plain', icon.name)
}
</script>

<style scoped>
.icon-cell :deep(svg) {
  width: 24px;
  height: 24px;
}

.icon-cell :deep(svg[stroke-width]) {
  stroke-width: var(--preview-stroke);
}
</style>
