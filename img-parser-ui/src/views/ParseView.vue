<template>
  <el-row :gutter="20" style="margin-top: 40px;">
    <el-col :span="12">
      <div :style="leftBoxStyle">
        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
          <img v-if="originalImageUrl" :src="originalImageUrl" :style="imgStyle" />
          <span v-else style="color: #aaa; font-size: 18px;">输入图像</span>
        </div>
      </div>
    </el-col>
    <el-col :span="12">
      <div :style="rightBoxStyle">
        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
          <img v-if="resultImage" :src="resultImage" :style="imgStyle" />
          <span v-else style="color: #aaa; font-size: 18px;">解析图像</span>
        </div>
      </div>
    </el-col>
  </el-row>
  <el-row :gutter="20" style="margin-top: 18px; align-items: flex-end;">
    <el-col :span="12" style="text-align: center;">
      <ImageUploader @image-selected="onImageSelected" />
    </el-col>
    <el-col :span="12" style="text-align: center; display: flex; justify-content: center; align-items: flex-end; gap: 16px;">
      <ParseModeSelector v-model:mode="mode" v-model:prompt="prompt" />
      <el-button type="primary" @click="onParse">解析</el-button>
    </el-col>
  </el-row>
  <div style="margin: 32px 0 16px 0; border-bottom: 2px solid #222; width: 100%;"></div>
  <UnitTable :units="parseUnits" />
</template>

<script setup>
import { ref, computed } from 'vue'
import ImageUploader from '@/components/ImageUploader.vue'
import ParseModeSelector from '@/components/ParseModeSelector.vue'
import UnitTable from '@/components/UnitTable.vue'
import { parseImage } from '@/api/parser'

const base64Image = ref('')
const originalImageUrl = ref('')
const resultImage = ref('')
const parseUnits = ref([])
const mode = ref('semantic')
const prompt = ref('')

const boxHeight = computed(() => Math.round(window.innerHeight * 0.3))
const boxWidth = computed(() => Math.round(boxHeight.value * 4 / 3))
const leftBoxStyle = computed(() => `width: ${boxWidth.value}px; height: ${boxHeight.value}px; background: #eee; border: 3px solid #111; border-radius: 8px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.04);`)
const rightBoxStyle = computed(() => `width: ${boxWidth.value}px; height: ${boxHeight.value}px; background: #eee; border: 3px solid #111; border-radius: 8px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.04);`)
const imgStyle = computed(() => {
  const h = boxHeight.value - 20
  return `max-width: 100%; max-height: ${h}px; object-fit: contain;`;
})

const onImageSelected = ({ base64, url }) => {
  base64Image.value = base64
  originalImageUrl.value = url
  resultImage.value = ''
  parseUnits.value = []
}

const onParse = async () => {
  if (!base64Image.value) return
  const data = await parseImage({
    image_base64: base64Image.value,
    mode: mode.value,
    prompt: prompt.value
  })
  resultImage.value = `data:image/png;base64,${data.result_image || ''}`
  parseUnits.value = data.units || []
}
</script>
