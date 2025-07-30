<template>
  <canvas ref="canvas" class="overlay-canvas" />
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'

const props = defineProps({
  layer: Object,
  showMask: { type: Boolean, default: true },
  showBbox: { type: Boolean, default: true },
  selectedIndex: { type: Number, default: null }
})

const canvas = ref(null)

function drawMask(ctx, unit, width, height, opacity = 0.5) {
  if (!unit.mask) return
  const maskImg = new Image()
  maskImg.src = `data:image/png;base64,${unit.mask}`
  maskImg.onload = () => {
    ctx.globalAlpha = opacity
    ctx.drawImage(maskImg, 0, 0, width, height)
    ctx.globalAlpha = 1.0
  }
}

function drawBBox(ctx, unit, scaleX, scaleY, isSelected) {
  if (!unit.bbox) return
  const { x1, y1, x2, y2 } = unit.bbox
  ctx.strokeStyle = isSelected ? 'green' : 'red'
  ctx.lineWidth = 2
  ctx.strokeRect(
    x1 * scaleX,
    y1 * scaleY,
    (x2 - x1) * scaleX,
    (y2 - y1) * scaleY
  )
  if (unit.label) {
    ctx.fillStyle = isSelected ? 'green' : 'red'
    ctx.font = '14px sans-serif'
    ctx.fillText(unit.label, x1 * scaleX + 4, y1 * scaleY + 14)
  }
}

function renderOverlay() {
  const cvs = canvas.value
  if (!props.layer || !cvs) return

  const img = new Image()
  img.src = props.layer.url
  img.onload = () => {
    const width = img.naturalWidth
    const height = img.naturalHeight
    cvs.width = width
    cvs.height = height

    const ctx = cvs.getContext('2d')
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)

    const scaleX = width / img.naturalWidth
    const scaleY = height / img.naturalHeight

    const units = props.layer.units || []
    units.forEach((unit, idx) => {
      if (unit.visible === false) return
      if (props.showMask) drawMask(ctx, unit, width, height)
      if (props.showBbox) drawBBox(ctx, unit, scaleX, scaleY, props.selectedIndex === idx)
    })
  }
}

watch(() => [props.layer, props.selectedIndex], () => nextTick(() => renderOverlay()), { deep: true })

onMounted(() => nextTick(() => renderOverlay()))
</script>

<style scoped>
.overlay-canvas {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
  pointer-events: none;
}
</style>
