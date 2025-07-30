<!-- components/ParseModeSelector.vue -->
<template>
  <el-form label-width="80px" style="font-size: 16px;">
    <el-form-item label="解析模式">
      <el-select v-model="selectedMode" placeholder="选择模式" style="width: 180px;" popper-append-to-body>
        <el-option v-for="m in modes" :key="m" :label="m" :value="m" />
      </el-select>
    </el-form-item>
    <el-form-item label="提示词" v-if="mode === 'clip' || mode === 'groundingdino'">
      <el-input v-model="promptText" placeholder="如：cup, bottle" style="width: 180px;" />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { computed } from 'vue'
const modes = ['semantic', 'omni', 'yolo', 'paddleocr', 'clip', 'sam2', 'groundingdino']
const props = defineProps({
  mode: String,
  prompt: String
})
const emit = defineEmits(['update:mode', 'update:prompt'])

const selectedMode = computed({
  get: () => props.mode,
  set: val => emit('update:mode', val)
})

const promptText = computed({
  get: () => props.prompt,
  set: val => emit('update:prompt', val)
})
</script>
