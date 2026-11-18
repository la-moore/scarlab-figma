<template>
  <div
    class="absolute right-0 bottom-0 size-3 cursor-nwse-resize text-fg-tertiary"
    aria-hidden="true"
    @pointerdown="start"
    @pointermove="move"
    @pointerup="stop"
    @lostpointercapture="stop"
  >
    <svg viewBox="0 0 12 12" class="size-full" fill="none" stroke="currentColor" stroke-linecap="round">
      <path d="M10 5 5 10M10 8.5 8.5 10" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { postToPlugin } from '../utils'

let resizing = false

function sizeFrom(event: PointerEvent) {
  return { width: event.clientX + 6, height: event.clientY + 6 }
}

function start(event: PointerEvent) {
  resizing = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function move(event: PointerEvent) {
  if (resizing) {
    postToPlugin({ type: 'resize', size: sizeFrom(event), persist: false })
  }
}

function stop(event: PointerEvent) {
  if (!resizing) return

  resizing = false
  postToPlugin({ type: 'resize', size: sizeFrom(event), persist: true })
}
</script>
