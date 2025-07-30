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

/**
 * Generates an array of visually distinct HSL color strings.
 * @param {number} n - The number of colors to generate.
 * @param {number} opacity - The opacity value for the colors (0 to 1).
 * @returns {string[]} An array of HSLA color strings.
 */
function generatePalette(n, opacity = 0.5) {
  if (n === 0) return []
  const colors = []
  // Use a golden angle approximation for more distinct colors
  const hueOffset = 0.61803398875
  for (let i = 0; i < n; i++) {
    const hue = (i * hueOffset * 360) % 360
    colors.push(`hsla(${hue}, 90%, 50%, ${opacity})`)
  }
  return colors
}

/**
 * Draws a colorized mask onto the canvas using an offscreen canvas to isolate
 * the composite operation for each mask.
 * @param {CanvasRenderingContext2D} ctx - The main canvas rendering context.
 * @param {object} unit - The layer unit containing the mask and bbox.
 * @param {string} color - The color to apply to the mask.
 */
async function drawMask(ctx, unit, color) {
  if (!unit.mask || !unit.bbox) return Promise.resolve(); // Return a resolved promise if no mask/bbox

  return new Promise((resolve) => {
    const maskImg = new Image()
    maskImg.src = `data:image/png;base64,${unit.mask}`
    maskImg.onload = () => {
      const { x1, y1, x2, y2 } = unit.bbox
      const maskWidth = x2 - x1
      const maskHeight = y2 - y1

      if (maskWidth <= 0 || maskHeight <= 0) {
        resolve(); // Resolve if mask dimensions are invalid
        return;
      }

      // Create an offscreen canvas for this specific mask
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = ctx.canvas.width; // Use full canvas size for consistency
      offscreenCanvas.height = ctx.canvas.height;
      const offscreenCtx = offscreenCanvas.getContext('2d');

      // 1. Draw the binary (black & white) mask at its correct bbox position onto the offscreen canvas.
      offscreenCtx.drawImage(maskImg, x1, y1, maskWidth, maskHeight)

      // 2. Change composite mode to 'source-in' for the offscreen canvas.
      offscreenCtx.globalCompositeOperation = 'source-in'

      // 3. Fill the entire offscreen canvas with the desired color. Due to 'source-in',
      //    only the mask pixels drawn in step 1 will be colorized on the offscreen canvas.
      offscreenCtx.fillStyle = color
      offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height) // Fill entire offscreen canvas

      // 4. Draw the fully colorized mask from the offscreen canvas onto the main context.
      ctx.drawImage(offscreenCanvas, 0, 0);

      resolve(); // Resolve the promise after drawing
    }
    maskImg.onerror = () => {
      console.error("Failed to load mask image for unit:", unit);
      resolve(); // Resolve even on error to not block other masks
    };
  });
}

/**
 * Draws a bounding box on the canvas.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {object} unit - The layer unit containing the bbox and label.
 * @param {string} color - The stroke color for the bbox.
 * @param {boolean} isSelected - If true, a different style is used.
 */
function drawBBox(ctx, unit, color, isSelected) {
  if (!unit.bbox) return
  const { x1, y1, x2, y2 } = unit.bbox

  const strokeColor = isSelected ? 'green' : color
  const fillColor = isSelected ? 'green' : color // For text label

  ctx.strokeStyle = strokeColor
  ctx.lineWidth = isSelected ? 3 : 2
  ctx.strokeRect(
    x1,
    y1,
    (x2 - x1),
    (y2 - y1)
  )

  if (unit.label) {
    // Save context to apply unique text styles without affecting other drawings
    ctx.save();
    ctx.fillStyle = fillColor;
    ctx.font = 'bold 14px sans-serif';
    ctx.textBaseline = 'top'; // Align text to the top of the bounding box
    // Position label inside the box at the top-left, with a small padding
    ctx.fillText(unit.label, x1 + 4, y1 + 4);
    ctx.restore(); // Restore context to previous state
  }
}

async function renderOverlay() {
  const cvs = canvas.value
  if (!props.layer || !cvs) return

  const img = new Image()
  img.src = props.layer.url
  img.onload = async () => { // Make onload async to await mask drawing
    const width = img.naturalWidth
    const height = img.naturalHeight
    cvs.width = width
    cvs.height = height

    const ctx = cvs.getContext('2d')
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)

    const units = props.layer.units || []
    if (units.length === 0) return

    // Generate a color palette for all units
    const palette = generatePalette(units.length)
    const selectedPalette = generatePalette(units.length, 0.75) // Brighter for selected

    const maskPromises = [];

    units.forEach((unit, idx) => {
      if (unit.visible === false) return

      const isSelected = props.selectedIndex === idx
      const color = isSelected ? selectedPalette[idx % selectedPalette.length] : palette[idx % palette.length]

      if (props.showMask) {
        // Collect all mask drawing promises
        maskPromises.push(drawMask(ctx, unit, color));
      }
    })

    // Wait for all masks to be drawn before drawing bounding boxes
    await Promise.all(maskPromises);

    // Draw bounding boxes after all masks are rendered
    // This ensures masks are "behind" the bboxes visually
    units.forEach((unit, idx) => {
      if (unit.visible === false) return

      const isSelected = props.selectedIndex === idx
      const color = isSelected ? selectedPalette[idx % selectedPalette.length] : palette[idx % palette.length]

      if (props.showBbox) {
        // Pass the same color to bbox for consistency
        drawBBox(ctx, unit, color, isSelected)
      }
    })
  }
  img.onerror = () => {
    console.error("Failed to load base layer image:", props.layer.url);
  };
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