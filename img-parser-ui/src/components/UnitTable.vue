<template>
  <el-table :data="units" border style="width: 100%; margin-top: 20px;">
    <el-table-column prop="type" label="类型" width="120" />
    <el-table-column prop="label" label="标签" width="100"/>
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
</template>

<script setup>
defineProps(['units'])
</script>
