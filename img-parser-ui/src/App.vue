// src/App.vue
<template>
  <el-container style="height: 100vh;">
    <el-header height="60px" style="padding: 0;">
      <TopMenu />
    </el-header>

    <el-container style="flex: 1; overflow: hidden;">
      <el-aside :style="{ width: navWidth + 'px', minWidth: '150px', maxWidth: '400px', overflowY: 'auto', background: '#f5f7fa', padding: '10px' }">
        <SideNav />
      </el-aside>

      <div @mousedown="startDrag('nav', $event)" style="width: 6px; cursor: col-resize; background: #ddd;"></div>

      <el-container style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
        <el-main
          :style="{ flex: canvasFlex, position: 'relative', overflow: 'auto', background: '#fff', padding: '10px' }"
          ref="canvasContainer"
        >
          <CanvasView />
        </el-main>

        <div @mousedown="startDrag('attr', $event)" style="height: 6px; cursor: row-resize; background: #ddd;"></div>

        <el-footer
          :style="{
            height: attrHeight + 'px',
            minHeight: '150px',
            maxHeight: '400px',
            background: '#f9fafc',
            borderTop: '1px solid #ccc',
            padding: '10px',
            overflowY: 'auto'
          }"
        >
          <ImageParseUnitView />
        </el-footer>
      </el-container>
    </el-container>

    <el-dialog
      v-model="store.showLabelingDialog"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      :modal="false"
      :draggable="true"
      width="300px"
      align-center
      class="labeling-dialog-no-header"
      :style="{ top: '70px', left: '20px' }"
      @close="store.closeLabelingDialog"
    >
      <div class="labeling-dialog-header" style="cursor: move">
        <span>标注工具</span>
        <el-button circle :icon="Close" @click="store.closeLabelingDialog" />
      </div>
      <LabelingToolbar />
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMainStore } from '@/store/main'
import eventBus from '@/utils/eventBus'
import { AppEvents } from '@/utils/eventTypes'

import TopMenu from '@/views/TopMenu.vue'
import SideNav from '@/views/SideNav.vue'
import CanvasView from '@/views/CanvasView.vue'
import ImageParseUnitView from '@/views/ImageParseUnitView.vue'
import LabelingToolbar from '@/components/LabelingToolbar.vue'
import { Close } from '@element-plus/icons-vue'

// 初始化 Store
const store = useMainStore()

// --- 事件监听器设置 ---
onMounted(() => {
  eventBus.on(AppEvents.OPEN_IMAGE, store.openImage)
  eventBus.on(AppEvents.SELECT_LAYER, store.selectLayer)
  eventBus.on(AppEvents.PARSE_REQUEST, store.parseSelectedLayer)
  eventBus.on(AppEvents.ASSIST_LABELING_REQUEST, store.assistLabelingRequest)
  eventBus.on(AppEvents.SET_LABELING_MODE, store.setLabelingMode)
  eventBus.on(AppEvents.TOGGLE_LABELING_DIALOG, store.toggleLabelingDialog)
})

onUnmounted(() => {
  // 组件销毁时清理所有监听器
  eventBus.all.clear()
})

// --- 布局相关的本地状态，这些不需要放入 Pinia ---
const navWidth = ref(250)
const attrHeight = ref(250)
const dragging = ref(null)
const startX = ref(0)
const startY = ref(0)
const startNavWidth = ref(0)
const startAttrHeight = ref(0)

const canvasFlex = computed(() => {
  const totalHeight = window.innerHeight - 60 - 6
  const canvasHeight = totalHeight - attrHeight.value
  return canvasHeight > 0 ? `0 0 ${canvasHeight}px` : '1'
})

function startDrag(type, event) {
  dragging.value = type
  startX.value = event.clientX
  startY.value = event.clientY
  startNavWidth.value = navWidth.value
  startAttrHeight.value = attrHeight.value
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}

function onDrag(e) {
  if (!dragging.value) return
  if (dragging.value === 'nav') {
    const deltaX = e.clientX - startX.value
    let newWidth = startNavWidth.value + deltaX
    if (newWidth < 150) newWidth = 150
    if (newWidth > 400) newWidth = 400
    navWidth.value = newWidth
  } else if (dragging.value === 'attr') {
    const deltaY = startY.value - e.clientY
    let newHeight = startAttrHeight.value + deltaY
    if (newHeight < 150) newHeight = 150
    if (newHeight > 400) newHeight = 400
    attrHeight.value = newHeight
  }
}

function stopDrag() {
  dragging.value = null
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
}
</script>

<style>
/* 全局样式可以放在这里或 App.vue 的 style 标签中 */
html, body, #app, .el-container {
  height: 100%;
  margin: 0;
  overflow: hidden;
}

/* 标注工具栏对话框的样式 */
.labeling-dialog-no-header .el-dialog__header {
  display: none;
}
.labeling-dialog-no-header .el-dialog__body {
  padding: 0;
  background: transparent;
}
.labeling-dialog-no-header .el-dialog {
  background-color: #f0f2f5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}
.labeling-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 15px;
  background-color: #e9edf2;
  border-bottom: 1px solid #dcdfe6;
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}
.labeling-dialog-header .el-button {
  padding: 0;
  width: 24px;
  height: 24px;
  font-size: 16px;
  border: none;
  background: none;
}
.labeling-dialog-header .el-button:hover {
  background-color: #f56c6c;
  color: #fff;
}
</style>
