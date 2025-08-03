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
      <VisualOverlay
        v-if="layer"
        :selectedIndex="selectedIndex"
        :showMask="showMaskEnabled"   :showBbox="showBBoxEnabled"   />
    </div>

    <div class="zoom-controls">
      <el-button @click="zoomOut" size="small">-</el-button>
      <span>{{ (scale * 100).toFixed(0) }}%</span>
      <el-button @click="zoomIn" size="small">+</el-button>
    </div>
    <div class="overlay-controls">
      <el-checkbox v-model="showMaskEnabled" label="显示遮罩" />
      <el-checkbox v-model="showBBoxEnabled" label="显示边界框" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMainStore } from '@/store/main' // 导入 Store
import VisualOverlay from '@/components/VisualOverlay.vue'

const store = useMainStore() // 使用 Store

const wrapper = ref(null)
const scale = ref(1)
const minScale = 0.1
const maxScale = 5
const zoomStep = 0.1
const translateX = ref(0)
const translateY = ref(0)
const selectedIndex = ref(null)
const isDragging = ref(false)
const lastMousePos = ref({ x: 0, y: 0 })
const layer = computed(() => store.selectedLayer)

const showMaskEnabled = ref(true)
const showBBoxEnabled = ref(true)

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
  // 从 store 获取当前图层信息
  if (!store.selectedLayer || !store.selectedLayer.units) return

  const containerRect = event.currentTarget.getBoundingClientRect()
  const clickXInContainer = event.clientX - containerRect.left
  const clickYInContainer = event.clientY - containerRect.top
  const x = clickXInContainer / scale.value
  const y = clickYInContainer / scale.value

  const foundIndex = store.selectedLayer.units.findIndex(unit => {
    if (!unit.bbox) return false
    const { x1, y1, x2, y2 } = unit.bbox
    return x >= x1 && x <= x2 && y >= y1 && y <= y2
  })

  selectedIndex.value = foundIndex >= 0 ? foundIndex : null
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

.overlay-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
  user-select: none;
  z-index: 10;
}
</style>
