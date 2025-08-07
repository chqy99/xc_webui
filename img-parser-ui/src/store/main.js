import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import * as api from '@/api/parser'
import { LayerData } from '@/types/layer_data'

export const useMainStore = defineStore('main', () => {
  const layers = ref([])
  const selectedLayerId = ref(null)
  const currentLabelingMode = ref(null)
  const showLabelingDialog = ref(false)

  const selectedLayer = computed(() =>
    layers.value.find(l => l.uid === selectedLayerId.value) || null
  )

  async function openImage(imageFile) {
    try {
      const uid = await api.uploadImage(imageFile.base64)
      const layer = new LayerData({
        uid,
        label: imageFile.name,
        url: imageFile.url,
        base64: imageFile.base64
      })
      layers.value = [layer]
      selectedLayerId.value = uid
      ElMessage.success('图像已打开')
    } catch (error) {
      console.error('Upload image failed:', error)
      ElMessage.error('图像上传失败')
    }
  }

  async function parseSelectedLayer({ mode, prompt }) {
    if (!selectedLayer.value) return ElMessage.warning('请先选择一个图层')
    try {
      const data = await api.parseImage({
        uid: selectedLayer.value.uid,
        mode,
        prompt
      })
      selectedLayer.value.setUnits(data.units || [])
      ElMessage.success(`'${mode}' 解析完成`)
    } catch (error) {
      console.error('Parse image failed:', error)
      ElMessage.error('图像解析失败')
    }
  }

  async function assistLabelingRequest({ mode, prompt }) {
    if (!selectedLayer.value) return ElMessage.warning('请先选择一个图层进行辅助标注')
    try {
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

  async function saveAllChanges() {
    if (!selectedLayer.value) return;

    // getChanges 返回 { add: [], update: [], delete: [] }
    const { add, update, delete: delUids } = selectedLayer.value.getChanges();
    const uid = selectedLayer.value.uid;

    try {
      let all_success = true;

      // 1. 新增单元
      if (add.length) {
        try {
          const addResultData = {
            uid,
            units: add,
            metadata: {}
          };
          await api.addResult({ result: addResultData });
        } catch (err) {
          all_success = false;
          ElMessage.error(err.response?.data?.detail || '新增失败');
        }
      }

      // 2. 更新单元
      if (update.length) {
        try {
          const updateResultData = {
            uid,
            units: update,
            metadata: {}
          };
          await api.updateResult({ result: updateResultData });
        } catch (err) {
          all_success = false;
          ElMessage.error(err.response?.data?.detail || '更改失败');
        }
      }

      // 3. 删除单元 (这部分调用是正确的)
      if (delUids.length) {
        try {
          await api.deleteUnits(uid, delUids);
        } catch (err) {
          all_success = false;
          ElMessage.error(err.response?.data?.detail || '删除失败');
        }
      }

      if (!all_success) {
        ElMessage.warning('部分更改未能保存');
        return;
      }

      // 所有操作成功后，同步前端状态
      selectedLayer.value.commitChanges();
      ElMessage.success('所有更改已成功保存！');
    } catch (err) {
      console.error('Save changes failed:', err);
      ElMessage.error('保存更改时发生未知错误');
    }
  }

  async function loadStorageUnitsFromServer(uid) {
    try {
      const units = await api.getResult(uid)
      const layer = selectedLayer.value
      if (layer) {
        layer.loadStorageUnits(units)
      }
    } catch (err) {
      console.error('加载远程 units 失败:', err)
      ElMessage.error('加载存储单元失败')
    }
  }

  function updateUnitData(uid, key, value) {
    selectedLayer.value?.updateUnit(uid, key, value)
  }

  function removeUnitsByUid(uids) {
    selectedLayer.value?.removeUnits(uids)
  }

  function setSelectedUnitIndex(index) {
    selectedLayer.value?.selectUnit(index)
  }

  function selectLayer(uid) {
    selectedLayerId.value = uid
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
    updateUnitData,
    removeUnitsByUid,
    setSelectedUnitIndex,
    saveAllChanges,
    loadStorageUnitsFromServer
  }
})
