<template>
  <div class="labeling-toolbar">
    <el-switch
      v-model="assistLabelingEnabled"
      active-text="辅助标注"
      inactive-text="关闭辅助"
      @change="toggleAssistLabeling"
    />
    <el-button-group>
      <el-button @click="setLabelingMode('point')">点标注</el-button>
      <el-button @click="setLabelingMode('rectangle')">矩形标注</el-button>
      <el-button @click="setLabelingMode('polygon')">多边形标注</el-button>
    </el-button-group>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

// 定义 prop，如果父组件需要传递初始值
const props = defineProps({
  initialAssistLabeling: {
    type: Boolean,
    default: false
  },
  initialLabelingMode: {
    type: String,
    default: null // 'rectangle', 'polygon', 'point'
  }
});

// 定义组件可以发出的事件
const emit = defineEmits(['assist-labeling-request', 'set-labeling-mode']);

// 内部状态，用于绑定 UI 控件
const assistLabelingEnabled = ref(props.initialAssistLabeling);
const currentLabelingMode = ref(props.initialLabelingMode);

// 监听 props 变化，同步内部状态（如果父组件可以更新这些值）
watch(() => props.initialAssistLabeling, (newVal) => {
  assistLabelingEnabled.value = newVal;
});
watch(() => props.initialLabelingMode, (newVal) => {
  currentLabelingMode.value = newVal;
});

function toggleAssistLabeling() {
  // 当辅助标注开启时，触发一个事件，将请求发送到父组件处理
  if (assistLabelingEnabled.value) {
    emit('assist-labeling-request', { mode: 'sam2', prompt: 'current_annotations_info' });
  }
  // 注意：'prompt' 在实际应用中会包含当前的标注信息，用于 SAM 模型。这里是占位符。
}

function setLabelingMode(mode) {
  currentLabelingMode.value = mode;
  // 触发事件，将当前选中的标注模式传递给父组件
  emit('set-labeling-mode', mode);
}
</script>

<style scoped>
.labeling-toolbar {
  display: flex; /* 使用 Flexbox 进行布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 10px; /* 元素间距 */
  padding: 10px; /* 内边距 */
  background-color: #f0f2f5; /* 背景色 */
  border-bottom: 1px solid #e4e7ed; /* 底部边框 */
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* 轻微阴影，增加层次感 */
}
</style>