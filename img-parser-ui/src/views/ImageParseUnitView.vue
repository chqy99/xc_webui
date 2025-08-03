<template>
  <div>
    <h3>图像解析单元</h3>
    <div v-if="units && units.length">
      <el-table
        :data="units"
        style="margin-top: 10px"
        size="small"
        border
        height="calc(100% - 40px)"
      >
        <el-table-column
          v-for="key in allKeys"
          :key="key"
          :prop="key"
          :label="formatLabel(key)"
          :min-width="key === 'text' || key === 'metadata' ? 200 : 100"
        >
          <template #default="scope">
            <!-- 显示 base64 图片 -->
            <img
              v-if="key === 'bbox_image' || key === 'mask_image'"
              :src="'data:image/png;base64,' + scope.row[key]"
              style="max-width: 100px"
            />
            <!-- 显示 metadata 为 JSON 字符串 -->
            <pre v-else-if="key === 'metadata'" style="font-size: 11px; white-space: pre-wrap;">
              {{ formatMetadata(scope.row[key]) }}
            </pre>
            <!-- 其他字段直接显示 -->
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
import { computed } from 'vue'
import { useMainStore } from '@/store/main'
import type { ImageParseUnit } from '@/types/image_parse_data'
import { imageParseUnitFieldLabels } from '@/types/image_parse_data'
import { formatMetadata } from '@/utils/displayFormat'

const store = useMainStore()
const units = computed<ImageParseUnit[]>(() => store.selectedLayer?.units || [])

const allKeys = computed(() => {
  const keys = new Set<string>()
  for (const unit of units.value) {
    Object.keys(unit).forEach((k) => keys.add(k))
  }
  const excluded = new Set(['image', 'mask'])
  return Array.from(keys).filter((k) => !excluded.has(k))
})

const formatLabel = (key: string) => imageParseUnitFieldLabels[key] || key
</script>
