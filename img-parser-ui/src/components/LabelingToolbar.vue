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
      <el-button @click-="setLabelingMode('polygon')">多边形标注</el-button>
    </el-button-group>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import eventBus from '@/utils/eventBus';
import { AppEvents } from '@/utils/eventTypes';

// 这个组件现在只管理自己的 UI 状态，并通过事件总线对外通信
const assistLabelingEnabled = ref(false);

function toggleAssistLabeling() {
  if (assistLabelingEnabled.value) {
    // 发出事件，请求辅助标注
    // 'prompt' 在实际应用中会包含当前的标注信息，这里是占位符
    eventBus.emit(AppEvents.ASSIST_LABELING_REQUEST, {
        mode: 'sam2',
        prompt: 'current_annotations_info'
    });
  }
}

function setLabelingMode(mode) {
  // 发出事件，请求切换标注模式
  eventBus.emit(AppEvents.SET_LABELING_MODE, mode);
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