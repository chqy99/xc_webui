<template>
  <el-menu mode="horizontal" style="height: 60px; line-height: 60px;" @select="onSelect">
    <el-sub-menu index="file" popper-class="file-menu">
      <template #title>文件</template>
      <el-menu-item index="open-image">打开图像</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="edit" v-if="true">
    <template #title>编辑</template>
    <el-menu-item index="parse_setting" @click="showDialog = true">解析</el-menu-item>
    </el-sub-menu>
    <el-menu-item index="view">视图</el-menu-item>
    <el-menu-item index="help">帮助</el-menu-item>

    <!-- 隐藏文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display:none"
      @change="onFileChange"
    />
  </el-menu>
  <el-dialog v-model="showDialog" title="解析设置" width="300px">
    <ParseModeSelector v-model:mode="mode" v-model:prompt="prompt" />
    <template #footer>
      <el-button @click="showDialog = false">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import ParseModeSelector from '@/components/ParseModeSelector.vue'

const showDialog = ref(false)
const mode = ref('semantic')
const prompt = ref('')

const emit = defineEmits(['open-image', 'parse-request'])
const fileInput = ref(null)

function onSelect(index) {
  if (index === 'open-image') {
    fileInput.value.click()
  }
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const url = reader.result
    const base64 = url.split(',')[1]
    emit('open-image', { name: file.name, url, base64 })
  }
  reader.readAsDataURL(file)
}

function onConfirm() {
  emit('parse-request', { mode: mode.value, prompt: prompt.value })
  showDialog.value = false
}
</script>
