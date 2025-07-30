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
        :layer="layer"
        :selectedIndex="selectedIndex"
        :showMask="true"
        :showBbox="true"
      />
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

const props = defineProps({
  layer: Object
})

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

const containerStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  transformOrigin: 'top left',
  // [!code--]
  // cursor: isDragging.value ? 'grabbing' : 'grab',
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

// [!code--]
// function onClick(event) {
//   if (!props.layer || !props.layer.units) return
//   const wrapperRect = wrapper.value.getBoundingClientRect()
//   const clickX = event.clientX - wrapperRect.left
//   const clickY = event.clientY - wrapperRect.top
//   const x = (clickX - translateX.value) / scale.value
//   const y = (clickY - translateY.value) / scale.value
//   const foundIndex = props.layer.units.findIndex(unit => {
//     if (!unit.bbox) return false
//     const { x1, y1, x2, y2 } = unit.bbox
//     return x >= x1 && x <= x2 && y >= y1 && y <= y2
//   })
//   selectedIndex.value = foundIndex >= 0 ? foundIndex : null
// }
// [!code++]
function onClick(event) {
  if (!props.layer || !props.layer.units) return

  // 获取 .canvas-container 元素当前的屏幕位置和尺寸。
  // 这个 rect 已经包含了 CSS 居中、手动拖拽(transform)和缩放(scale)的所有效果。
  const containerRect = event.currentTarget.getBoundingClientRect()

  // 1. 计算点击位置相对于 .canvas-container 左上角的坐标
  const clickXInContainer = event.clientX - containerRect.left
  const clickYInContainer = event.clientY - containerRect.top

  // 2. 将这个坐标根据当前的缩放比例，反向计算出在原始图片上的坐标
  const x = clickXInContainer / scale.value
  const y = clickYInContainer / scale.value

  // 3. 判断是否命中 bbox (这部分逻辑不变)
  const foundIndex = props.layer.units.findIndex(unit => {
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
  /* [!code ++] */
  cursor: default; /* 默认光标 */
}

/* [!code ++] */
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
