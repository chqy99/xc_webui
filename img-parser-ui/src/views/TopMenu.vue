<template>
  <el-menu mode="horizontal" style="height: 60px; line-height: 60px;" @select="onSelect">
    <el-sub-menu index="file" popper-class="file-menu">
      <template #title>文件</template>
      <el-menu-item index="open-image">打开图像</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="edit" v-if="true">
      <template #title>编辑</template>
      <el-menu-item index="parse_setting" @click="showDialog = true">解析</el-menu-item>
      <el-menu-item index="labeling">标注工具</el-menu-item> </el-sub-menu>
    <el-menu-item index="view">视图</el-menu-item>
    <el-menu-item index="help">帮助</el-menu-item>

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
// IMPORTANT: 移除 LabelingToolbar 的导入

const showDialog = ref(false)
const mode = ref('semantic')
const prompt = ref('')

// 这个状态现在只需要控制菜单项自身的行为，不再直接控制工具栏的显示
// const showLabelingToolbar = ref(false) // 可以删除或注释掉

// 增加一个新的事件：用于通知 App.vue 切换标注工具栏弹窗的可见性
const emit = defineEmits([
  'open-image',
  'parse-request',
  'toggle-labeling-dialog', // 新增：通知 App.vue 切换弹窗
  'assist-labeling-request',
  'set-labeling-mode'
])
const fileInput = ref(null)

function onSelect(index) {
  if (index === 'open-image') {
    fileInput.value.click()
  } else if (index === 'labeling') {
    // 每次点击都发出事件，由 App.vue 决定是显示还是隐藏
    emit('toggle-labeling-dialog');
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
