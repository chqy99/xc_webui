<template>
  <canvas ref="canvas" class="overlay-canvas" />
</template>

<script setup>
import { ref, watch, nextTick, onMounted, computed } from 'vue'
import { useMainStore } from '@/store/main'
import { generatePalette, drawMask, drawBBox } from '@/utils/visual_tools'

const props = defineProps({
  clickCoord: Object
})

const canvas = ref(null)
const mainStore = useMainStore()

// Use the selectedLayer from the store directly
const selectedLayer = computed(() => mainStore.selectedLayer)
const showMask = computed(() => selectedLayer.value?.showMask ?? true)
const showBBox = computed(() => selectedLayer.value?.showBBox ?? true)
const selectedIndex = computed(() => {
  const coord = props.clickCoord
  if (!coord || !selectedLayer.value?.units) return null
  const units = selectedLayer.value.units
  const index = units.findIndex(unit => {
    const b = unit.bbox
    return b && coord.x >= b.x1 && coord.x <= b.x2 && coord.y >= b.y1 && coord.y <= b.y2
  })
  mainStore.setSelectedUnitIndex(index)
  return index
})

async function renderOverlay() {
  const cvs = canvas.value
  if (!selectedLayer.value || !cvs) return

  const img = new Image()
  img.src = selectedLayer.value.url
  img.onload = async () => {
    const width = img.naturalWidth
    const height = img.naturalHeight
    cvs.width = width
    cvs.height = height

    const ctx = cvs.getContext('2d')
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)

    const units = selectedLayer.value.units || []
    if (units.length === 0) return

    const palette = generatePalette(units.length)
    const selectedPalette = generatePalette(units.length, 0.75)

    const maskPromises = [];

    units.forEach((unit, idx) => {
      if (unit.visible === false) return

      const isSelected = selectedIndex.value === idx
      const color = isSelected ? selectedPalette[idx % selectedPalette.length] : palette[idx % palette.length]

      if (showMask.value && unit.mask && unit.bbox) {
        // Pass img, unit.mask, and unit.bbox individually
        maskPromises.push(drawMask(ctx, img, unit.mask, unit.bbox, color));
      }
    })

    await Promise.all(maskPromises);

    units.forEach((unit, idx) => {
      if (unit.visible === false) return

      const isSelected = selectedIndex.value === idx
      const color = isSelected ? selectedPalette[idx % selectedPalette.length] : palette[idx % palette.length]

      if (showBBox.value && unit.bbox) {
        // Pass unit.bbox, unit.label, and color individually
        drawBBox(ctx, unit.bbox, unit.label, color, isSelected)
      }
    })
  }
  img.onerror = () => {
    console.error("Failed to load base layer image:", selectedLayer.value.url);
  };
}

watch(() => [selectedLayer.value, selectedIndex.value, showMask.value, showBBox.value, props.clickCoord],
      () => nextTick(() => renderOverlay()), { deep: true })

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