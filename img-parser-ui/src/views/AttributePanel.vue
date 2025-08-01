// src/views/AttributePanel.vue
<template>
  <div>
    <h3>解析属性栏</h3>
    <div v-if="store.selectedLayer">
      <el-table
        v-if="store.selectedLayer.units && store.selectedLayer.units.length"
        :data="store.selectedLayer.units"
        style="margin-top: 10px"
        size="small"
        border
        height="calc(100% - 40px)"
      >
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="label" label="标签" width="100" />
        <el-table-column prop="text" label="文本" />
        <el-table-column prop="score" label="置信度" width="100" />
        <el-table-column label="bbox裁减图" width="120">
          <template #default="scope">
            <img v-if="scope.row.bbox_image" :src="'data:image/png;base64,' + scope.row.bbox_image" style="max-width: 100px;" />
          </template>
        </el-table-column>
        <el-table-column label="掩膜图" width="120">
          <template #default="scope">
            <img v-if="scope.row.mask_image" :src="'data:image/png;base64,' + scope.row.mask_image" style="max-width: 100px;" />
          </template>
        </el-table-column>
      </el-table>
       <div v-else style="color: #aaa; text-align: center; padding-top: 20px;">当前图层无解析单元</div>
    </div>
    <div v-else style="color: #aaa; text-align: center; padding-top: 20px;">请在左侧选择一个图层</div>
  </div>
</template>

<script setup>
import { useMainStore } from '@/store/main'

const store = useMainStore()
</script>