// src/store/main.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import * as api from '@/api/parser' // 导入整个 API 模块

export const useMainStore = defineStore('main', () => {
  // --- STATE ---
  const layers = ref([])
  const selectedLayerId = ref(null)
  const currentLabelingMode = ref(null)
  const showLabelingDialog = ref(false)

  // --- GETTERS ---
  const selectedLayer = computed(() => {
    if (!selectedLayerId.value || layers.value.length === 0) return null
    return layers.value.find(l => l.uid === selectedLayerId.value)
  })

  // --- ACTIONS ---
  async function openImage(imageFile) {
    try {
      // 调用 API 层
      const uid = await api.uploadImage(imageFile.base64)
      console.log('parseImage uid:', uid)

      const newLayer = {
        uid: uid,
        label: imageFile.name,
        url: imageFile.url,
        base64: imageFile.base64,
        units: [],
        annotations: []
      }
      layers.value = [newLayer]
      selectedLayerId.value = uid
      ElMessage.success('图像已打开')
    } catch (error) {
      console.error('Upload image failed:', error)
      ElMessage.error('图像上传失败')
    }
  }

  function selectLayer(layerId) {
    selectedLayerId.value = layerId
  }

  async function parseSelectedLayer({ mode, prompt }) {
    if (!selectedLayer.value) {
      ElMessage.warning('请先选择一个图层')
      return
    }
    try {
      // 调用 API 层
      const data = await api.parseImage({
        uid: selectedLayer.value.uid,
        mode,
        prompt
      })

      const layerToUpdate = layers.value.find(l => l.uid === selectedLayer.value.uid)
      if (layerToUpdate) {
        layerToUpdate.units = data.units || []
      }
      ElMessage.success(`'${mode}' 解析完成`)
    } catch (error) {
      console.error('Parse image failed:', error)
      ElMessage.error('图像解析失败')
    }
  }

  async function assistLabelingRequest({ mode, prompt }) {
    if (!selectedLayer.value) {
      ElMessage.warning('请先选择一个图层进行辅助标注')
      return
    }
    try {
      // 调用 API 层
      const data = await api.assistLabel({
        uid: selectedLayer.value.uid,
        mode,
        prompt
      })
      console.log('辅助标注结果:', data)
      ElMessage.success('辅助标注请求成功')
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message
      console.error('Assist labeling failed:', error)
      ElMessage.error(`辅助标注失败: ${errorMsg}`)
    }
  }

  function setLabelingMode(mode) {
    currentLabelingMode.value = mode
    ElMessage.info(`标注模式切换为: ${mode}`)
  }

  function toggleLabelingDialog() {
    showLabelingDialog.value = !showLabelingDialog.value
  }

  function closeLabelingDialog() {
    showLabelingDialog.value = false
  }

  return {
    layers,
    selectedLayerId,
    currentLabelingMode,
    showLabelingDialog,
    selectedLayer,
    openImage,
    selectLayer,
    parseSelectedLayer,
    assistLabelingRequest,
    setLabelingMode,
    toggleLabelingDialog,
    closeLabelingDialog,
  }
})
