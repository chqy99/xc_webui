<template>
  <div
    class="canvas-wrapper"
    :class="{ 'is-dragging': isDragging }"
    ref="wrapper"
    @wheel.prevent="onWheel"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
    @mousemove="onMouseMove"
  >
    <div
      class="canvas-container"
      :style="containerStyle"
      @click="onClick"
    >
      <VisualOverlay :clickCoord="clickCoord"/>
    </div>

    <div class="zoom-controls">
      <el-button @click="zoomOut" size="small">-</el-button>
      <span>{{ (scale * 100).toFixed(0) }}%</span>
      <el-button @click="zoomIn" size="small">+</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import VisualOverlay from '@/components/VisualOverlay.vue'

const clickCoord = ref(null) // 原图坐标（x, y）

const wrapper = ref(null)
const scale = ref(1)
const minScale = 0.1
const maxScale = 5
const zoomStep = 0.1
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const lastMousePos = ref({ x: 0, y: 0 })

const containerStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  transformOrigin: 'top left',
  display: 'inline-block',
  'user-select': 'none',
}))

function zoomIn() {
  scale.value = Math.min(maxScale, scale.value + zoomStep)
}

function zoomOut() {
  scale.value = Math.max(minScale, scale.value - zoomStep)
}

function onWheel(event) {
  const delta = event.deltaY < 0 ? zoomStep : -zoomStep
  const newScale = Math.min(maxScale, Math.max(minScale, scale.value + delta))
  if (newScale !== scale.value) {
    const rect = wrapper.value.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    const scaleRatio = newScale / scale.value

    translateX.value = mouseX - scaleRatio * (mouseX - translateX.value)
    translateY.value = mouseY - scaleRatio * (mouseY - translateY.value)
    scale.value = newScale
  }
}

function onMouseDown(event) {
  if (event.button !== 1) return
  event.preventDefault()
  isDragging.value = true
  lastMousePos.value = { x: event.clientX, y: event.clientY }
}

function onMouseUp() {
  isDragging.value = false
}

function onMouseMove(event) {
  if (!isDragging.value) return
  const dx = event.clientX - lastMousePos.value.x
  const dy = event.clientY - lastMousePos.value.y
  translateX.value += dx
  translateY.value += dy
  lastMousePos.value = { x: event.clientX, y: event.clientY }
}

function onClick(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = (event.clientX - rect.left - translateX.value) / scale.value
  const y = (event.clientY - rect.top - translateY.value) / scale.value
  clickCoord.value = { x, y }
}

</script>

<style scoped>
.canvas-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  cursor: default; /* 默认光标 */
}

/* 当 isDragging 为 true 时，wrapper 会被添加 .is-dragging 类 */
.canvas-wrapper.is-dragging {
  cursor: grabbing; /* 正在拖拽的光标 */
}

.canvas-container {
  position: relative;
  display: inline-block;
  background: white;
}

.overlay-canvas {
  user-select: none;
  pointer-events: none;
  display: block;
}

.zoom-controls {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
  user-select: none;
  z-index: 10;
}
</style>
