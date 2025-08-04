<template>
  <div>
    <div class="header-bar">
      <h3>图像解析单元</h3>
      <div class="controls" v-if="units && units.length">
        <el-checkbox v-model="selectAll" @change="toggleAll">全选</el-checkbox>
        <el-button size="small" @click="deleteSelected" type="danger">删除选中</el-button>
        <el-button size="small" @click="saveChanges" type="primary">提交更改</el-button>
      </div>
    </div>

    <div v-if="units && units.length">
      <el-table
        ref="tableRef"
        :data="units"
        style="margin-top: 10px"
        size="small"
        border
        height="calc(100% - 40px)"
        @selection-change="onSelectionChange"
        :row-class-name="rowClassName"
        @row-click="onRowClick"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column
          v-for="key in allKeys"
          :key="key"
          :prop="key"
          :label="formatLabel(key)"
          :min-width="key === 'text' || key === 'metadata' ? 200 : 100"
        >
          <template #default="scope">
            <img
              v-if="key === 'bbox_image' || key === 'mask_image'"
              :src="'data:image/png;base64,' + scope.row[key]"
              style="max-width: 100px"
            />
            <pre v-else-if="key === 'metadata'" style="font-size: 11px; white-space: pre-wrap;">
              {{ formatMetadata(scope.row[key]) }}
            </pre>
            <el-input
              v-else-if="isEditable(key)"
              :model-value="scope.row[key]"
              @update:modelValue="newValue => handleUpdate(scope.row.uid, key, newValue)"
              size="small"
            />
            <span v-else>{{ scope.row[key] }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else style="color: #aaa; text-align: center; padding-top: 20px;">
      当前没有解析单元
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMainStore } from '@/store/main'
import type { ImageParseUnit } from '@/types/image_parse_data'
import { imageParseUnitFieldLabels } from '@/types/image_parse_data'
import { formatMetadata } from '@/utils/displayFormat'

const store = useMainStore()
const tableRef = ref()
const selectedRows = ref<ImageParseUnit[]>([])
const selectAll = ref(false)

const units = computed<ImageParseUnit[]>(() => store.selectedLayer?.units || [])

const allKeys = computed(() => {
  const keys = new Set<string>()
  for (const unit of units.value) {
    Object.keys(unit).forEach((k) => keys.add(k))
  }
  const excluded = new Set(['image', 'mask']) // 非展示字段
  return Array.from(keys).filter((k) => !excluded.has(k))
})

const formatLabel = (key: string) => imageParseUnitFieldLabels[key] || key

const onSelectionChange = (val: ImageParseUnit[]) => {
  selectedRows.value = val
  selectAll.value = val.length === units.value.length
}

const toggleAll = () => {
  tableRef.value?.clearSelection()
  if (selectAll.value) {
    units.value.forEach((row) => tableRef.value.toggleRowSelection(row, true))
  }
}

const deleteSelected = () => {
  const uidsToDelete = selectedRows.value.map((u) => u.uid)
  store.removeUnitsByUid(uidsToDelete)
  selectedRows.value = []
  selectAll.value = false
}

const saveChanges = () => {
  store.saveAllChanges()
}

const isEditable = (key: string) => {
  return ['text', 'label', 'score'].includes(key)
}

const selectedUnitUid = computed(() => {
  const layer = store.selectedLayer
  if (!layer || layer.selectedUnitIndex === null || layer.selectedUnitIndex < 0) {
    return null
  }
  console.log('Selected unit UID:', layer.units?.[layer.selectedUnitIndex]?.uid)
  return layer.units?.[layer.selectedUnitIndex]?.uid
})

const rowClassName = ({ row }: { row: ImageParseUnit }) => {
  return selectedUnitUid.value && selectedUnitUid.value === row.uid ? 'selected-row' : ''
}

const onRowClick = (row: ImageParseUnit) => {
  const idx = store.selectedLayer?.units?.findIndex(u => u.uid === row.uid)
  if (idx !== undefined && idx >= 0) {
    store.setSelectedUnitIndex(idx)
  }
}

const handleUpdate = (uid: string, key: string, value: any) => {
  store.updateUnitData(uid, key, value)
}
</script>

<style scoped>
/* 新增样式，用于顶部布局 */
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.controls {
  display: flex;
  gap: 10px; /* 控制按钮之间的间距 */
  align-items: center;
}

/* 保持高亮行样式 */
::v-deep(.el-table__row.selected-row) {
  background-color: rgb(151, 236, 156) !important;
}
</style>