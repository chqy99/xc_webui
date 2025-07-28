<template>
  <div>
    <el-upload
      :auto-upload="false"
      :show-file-list="false"
      accept="image/*"
      @change="handleChange"
    >
      <el-button type="primary">上传图像</el-button>
    </el-upload>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['image-selected'])

function handleChange({ raw }) {
  const reader = new FileReader()
  reader.onload = () => {
    const base64 = reader.result.split(',')[1]
    emit('image-selected', { base64, url: reader.result })
  }
  reader.readAsDataURL(raw)
}
</script>
