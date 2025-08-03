// src/utils/visual_tools.js (更新颜色规则)

/**
 * Generates an array of visually distinct HSL color strings.
 * @param {number} n - The number of colors to generate.
 * @param {number} opacity - The opacity value for the colors (0 to 1).
 * @returns {string[]} An array of HSLA color strings.
 */
export function generatePalette(n, opacity = 0.5) {
  if (n === 0) return []
  const colors = []
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
 * @param {HTMLImageElement} baseImage - The base image element (used for its dimensions).
 * @param {string} maskBase64 - The base64 string of the mask image.
 * @param {object} bbox - The bounding box object {x1, y1, x2, y2}.
 * @param {string} color - The color to apply to the mask.
 * @returns {Promise<void>} A promise that resolves when the mask is drawn.
 */
export async function drawMask(ctx, baseImage, maskBase64, bbox, color) {
  if (!maskBase64 || !bbox) return Promise.resolve();

  return new Promise((resolve) => {
    const maskImg = new Image();
    maskImg.src = `data:image/png;base64,${maskBase64}`;
    maskImg.onload = () => {
      const { x1, y1, x2, y2 } = bbox;
      const maskWidth = x2 - x1;
      const maskHeight = y2 - y1;

      if (maskWidth <= 0 || maskHeight <= 0) {
        resolve();
        return;
      }

      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = baseImage.naturalWidth;
      offscreenCanvas.height = baseImage.naturalHeight;
      const offscreenCtx = offscreenCanvas.getContext('2d');

      offscreenCtx.drawImage(maskImg, x1, y1, maskWidth, maskHeight);
      offscreenCtx.globalCompositeOperation = 'source-in';
      offscreenCtx.fillStyle = color;
      offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

      ctx.drawImage(offscreenCanvas, 0, 0);
      resolve();
    };
    maskImg.onerror = () => {
      console.error("Failed to load mask image.");
      resolve();
    };
  });
}

/**
 * Draws a bounding box on the canvas.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {object} bbox - The bounding box object {x1, y1, x2, y2}.
 * @param {string} label - The label text for the bounding box.
 * @param {string} color - The stroke color for the bbox.
 * @param {boolean} isSelected - If true, a different style is used.
 */
export function drawBBox(ctx, bbox, label, color, isSelected) {
  if (!bbox) return;
  const { x1, y1, x2, y2 } = bbox;

  const strokeColor = isSelected ? 'green' : color;
  const fillColor = isSelected ? 'green' : color;

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = isSelected ? 3 : 2;
  ctx.strokeRect(
    x1,
    y1,
    (x2 - x1),
    (y2 - y1)
  );

  if (label) {
    ctx.save();
    ctx.fillStyle = fillColor;
    ctx.font = 'bold 14px sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText(label, x1 + 4, y1 + 4);
    ctx.restore();
  }
}
