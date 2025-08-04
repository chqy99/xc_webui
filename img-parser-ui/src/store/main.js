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
        storage_units: [],
        showMask: true,
        showBBox: true,
        selectedUnitIndex: null,
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

  function removeUnitsByUid(uids) {
    if (!this.selectedLayer) return
    this.selectedLayer.units = this.selectedLayer.units.filter(u => !uids.includes(u.uid))
  }

  function setSelectedUnitIndex(index) {
    if (selectedLayer.value) {
      selectedLayer.value.selectedUnitIndex = index
    }
  }

  function updateUnitData(uid, key, value) {
    if (selectedLayer.value) {
      const unit = selectedLayer.value.units.find(u => u.uid === uid)
      if (unit) {
        unit[key] = value
      }
    }
  }

  function getUnitChanges() {
    const current = selectedLayer.value?.units || []
    const original = selectedLayer.value?.storage_units || []

    const originalMap = Object.fromEntries(original.map(u => [u.uid, u]))
    const currentMap = Object.fromEntries(current.map(u => [u.uid, u]))

    const add = current.filter(u => !originalMap[u.uid])
    const update = current.filter(u => {
      const origin = originalMap[u.uid]
      if (!origin) return false
      return JSON.stringify(origin) !== JSON.stringify(u) // 简单比较，可优化
    })
    const deleteUids = original
      .filter(o => !currentMap[o.uid])
      .map(o => o.uid)

    return { add, update, delete: deleteUids }
  }

  async function saveAllChanges() {
    if (!selectedLayer.value) return

    const { add, update, delete: delUids } = getUnitChanges()

    try {
      if (add.length) await api.addUnits(add.map(u => ({ ...u, layer_uid: selectedLayer.value.uid })))
      if (update.length) await api.updateUnits(update.map(u => ({ ...u, layer_uid: selectedLayer.value.uid })))
      if (delUids.length) await api.deleteUnits(delUids)

      // 保存成功后更新 storage_units 为当前 units
      selectedLayer.value.storage_units = JSON.parse(JSON.stringify(selectedLayer.value.units))
      ElMessage.success('更改已保存')
    } catch (err) {
      console.error('保存失败:', err)
      ElMessage.error('保存更改失败')
    }
  }

  async function loadStorageUnitsFromServer(uid) {
    const result = await api.loadUnitsByLayer(uid)
    const layer = selectedLayer.value
    if (layer) {
      layer.units = result.map(u => ({ ...u }))
      layer.storage_units = JSON.parse(JSON.stringify(layer.units))
    }
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
    removeUnitsByUid,
    setSelectedUnitIndex,
    updateUnitData,
  }
})
