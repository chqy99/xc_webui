<template>
  <div>
    <h3>解析属性栏</h3>
    <div v-if="layer">
      <el-table
        v-if="layer.units && layer.units.length"
        :data="layer.units"
        style="margin-top: 10px"
        size="small"
        border
      >
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="label" label="标签" width="100" />
        <el-table-column prop="text" label="文本" />
        <el-table-column prop="score" label="置信度" width="100" />
        <el-table-column label="bbox裁减图" width="200">
          <template #default="scope">
            <img v-if="scope.row.bbox_image" :src="'data:image/png;base64,' + scope.row.bbox_image" style="max-width: 100px;" />
          </template>
        </el-table-column>
        <el-table-column label="掩膜图" width="200">
          <template #default="scope">
            <img v-if="scope.row.mask_image" :src="'data:image/png;base64,' + scope.row.mask_image" style="max-width: 100px;" />
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else style="color: #aaa;">请选择一个图层</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  layer: Object
})

const units = computed(() => props.layer?.units || [])
</script>

