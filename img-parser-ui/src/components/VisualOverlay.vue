<template>
  <canvas ref="canvas" class="overlay-canvas" />
</template>

<script setup>
import { ref, watch, nextTick, onMounted, computed } from 'vue'
import { useMainStore } from '@/store/main'
import { generatePalette, drawMask, drawBBox } from '@/utils/visual_tools'

const props = defineProps({
  showMask: { type: Boolean, default: true },
  showBBox: { type: Boolean, default: true },
  selectedIndex: { type: Number, default: null }
})

const canvas = ref(null)
const mainStore = useMainStore()

// Use the selectedLayer from the store directly
const selectedLayer = computed(() => mainStore.selectedLayer)

async function renderOverlay() {
  const cvs = canvas.value
  // Use selectedLayer from the store instead of props.layer
  if (!selectedLayer.value || !cvs) return // This line correctly handles null selectedLayer

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

      const isSelected = props.selectedIndex === idx
      const color = isSelected ? selectedPalette[idx % selectedPalette.length] : palette[idx % palette.length]

      if (props.showMask && unit.mask && unit.bbox) {
        // Pass img, unit.mask, and unit.bbox individually
        maskPromises.push(drawMask(ctx, img, unit.mask, unit.bbox, color));
      }
    })

    await Promise.all(maskPromises);

    units.forEach((unit, idx) => {
      if (unit.visible === false) return

      const isSelected = props.selectedIndex === idx
      const color = isSelected ? selectedPalette[idx % selectedPalette.length] : palette[idx % palette.length]

      if (props.showBBox && unit.bbox) {
        // Pass unit.bbox, unit.label, and color individually
        drawBBox(ctx, unit.bbox, unit.label, color, isSelected)
      }
    })
  }
  img.onerror = () => {
    console.error("Failed to load base layer image:", selectedLayer.value.url);
  };
}

watch(() => [selectedLayer.value, props.selectedIndex, props.showMask, props.showBBox],
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