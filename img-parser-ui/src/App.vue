<template>
  <el-container style="height: 100vh;">
    <el-header height="60px" style="padding: 0;">
      <TopMenu
        @open-image="onOpenImage"
        @parse-request="onParseRequest"
        @assist-labeling-request="onAssistLabelingRequest"
        @set-labeling-mode="onSetLabelingMode"
        @toggle-labeling-dialog="onToggleLabelingDialog"
      />
    </el-header>

    <el-container style="flex: 1; overflow: hidden;">
      <el-aside :style="{ width: navWidth + 'px', minWidth: '150px', maxWidth: '400px', overflowY: 'auto', background: '#f5f7fa', padding: '10px' }">
        <SideNav :layers="layers" @select-layer="onSelectLayer" />
      </el-aside>

      <div @mousedown="startDrag('nav')" style="width: 6px; cursor: col-resize; background: #ddd;"></div>

      <el-container style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
        <el-main
          :style="{ flex: canvasFlex, position: 'relative', overflow: 'auto', background: '#fff', padding: '10px' }"
          ref="canvasContainer"
        >
          <CanvasView :layer="selectedLayer" :labelingMode="currentLabelingMode" />
        </el-main>

        <div
          @mousedown="startDrag('attr')"
          style="height: 6px; cursor: row-resize; background: #ddd;"
        ></div>

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
          <AttributePanel :layer="selectedLayer" />
        </el-footer>
      </el-container>
    </el-container>

    <el-dialog
      v-model="showLabelingDialog"
      :show-close="true" :close-on-click-modal="false" :close-on-press-escape="true" :modal="false" :draggable="true" :fullscreen="false" width="300px"              :align-center="false"      class="labeling-dialog-no-header" :style="{ top: '70px', left: '20px' }" @close="onCloseLabelingDialog" >
      <template>
        <div class="labeling-dialog-header">
          <span :id="titleId" :class="titleClass">标注工具</span> <el-button circle :icon="Close" @click="close" /> </div>
      </template>

      <LabelingToolbar
        @assist-labeling-request="onAssistLabelingRequest"
        @set-labeling-mode="onSetLabelingMode"
      />
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import TopMenu from '@/views/TopMenu.vue'
import SideNav from '@/views/SideNav.vue'
import CanvasView from '@/views/CanvasView.vue'
import AttributePanel from '@/views/AttributePanel.vue'
import LabelingToolbar from '@/components/LabelingToolbar.vue'
import { ElMessage } from 'element-plus'
import { uploadImage, parseImage, assistLabel } from '@/api/parser'
import { Close } from '@element-plus/icons-vue' // 导入 Element Plus 的关闭图标

const navWidth = ref(250)
const attrHeight = ref(250)
const dragging = ref(null)
const startX = ref(0)
const startY = ref(0)
const startNavWidth = ref(0)
const startAttrHeight = ref(0)

const currentLabelingMode = ref(null)
const showLabelingDialog = ref(false)

const canvasFlex = computed(() => {
  const totalHeight = window.innerHeight - 60 - 6
  const canvasHeight = totalHeight - attrHeight.value
  return canvasHeight > 0 ? `0 0 ${canvasHeight}px` : '1'
})

function startDrag(type) {
  dragging.value = type
  startX.value = window.event.clientX
  startY.value = window.event.clientY
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

const layers = ref([])
const selectedLayer = ref(null)

async function onOpenImage(image) {
  const uid = await uploadImage(image.base64)
  console.log('parseImage uid:', uid)
  layers.value = [{
    uid: uid,
    label: image.name,
    url: image.url,
    base64: image.base64,
    annotations: []
  }]
  selectedLayer.value = layers.value[0]
}

function onSelectLayer(layer) {
  selectedLayer.value = layer
}

async function onParseRequest({ mode, prompt }) {
  if (!selectedLayer.value || !selectedLayer.value.uid) {
    ElMessage.warning('请先打开图像')
    return
  }

  const data = await parseImage({
    uid: selectedLayer.value.uid,
    mode,
    prompt
  })

  selectedLayer.value.units = data.units || []
}

async function onAssistLabelingRequest({ mode, prompt }) {
  if (!selectedLayer.value || !selectedLayer.value.uid) {
    ElMessage.warning('请先打开图像才能进行辅助标注')
    return
  }

  try {
    const data = await assistLabel({
      uid: selectedLayer.value.uid,
      mode: mode,
      prompt: prompt
    });
    console.log('辅助标注结果:', data);
    ElMessage.success('辅助标注请求已发送');
  } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        ElMessage.error('辅助标注失败: ' + error.response.data.detail);
      } else {
        ElMessage.error('辅助标注失败: ' + error.message);
      }
  }
}

function onSetLabelingMode(mode) {
  currentLabelingMode.value = mode;
  ElMessage.info(`标注模式已切换为: ${mode}`);
}

function onToggleLabelingDialog() {
  showLabelingDialog.value = !showLabelingDialog.value;
}

// 新增方法：当 el-dialog 关闭时，更新 showLabelingDialog 状态
function onCloseLabelingDialog() {
  showLabelingDialog.value = false;
}
</script>

<style scoped>
html,
body,
#app {
  height: 100%;
  margin: 0;
}

/* 隐藏 el-dialog 默认的头部区域，以便我们自定义 */
.labeling-dialog-no-header :deep(.el-dialog__header) {
  display: none; /* 完全隐藏默认头部 */
}

/* 调整 el-dialog 的主体内容区域，移除默认 padding 和背景 */
.labeling-dialog-no-header :deep(.el-dialog__body) {
  padding: 0px; /* 移除内边距，让 LabelingToolbar 内部的 padding 生效 */
  background: none; /* 移除默认背景，使用 LabelingToolbar 自己的背景 */
}

/* 为整个弹窗添加一个背景色和阴影，使其更像工具栏 */
.labeling-dialog-no-header :deep(.el-dialog) {
  background-color: #f0f2f5; /* 与 LabelingToolbar 内部颜色保持一致 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 增加阴影效果 */
  border-radius: 4px; /* 轻微圆角 */
  overflow: hidden; /* 防止内容溢出圆角 */
  /* min-width: 250px; 根据实际内容调整，防止内容被挤压 */
}

/* 新增样式：自定义弹窗头部，包含标题和关闭按钮 */
.labeling-dialog-header {
  display: flex;
  justify-content: space-between; /* 标题和按钮左右对齐 */
  align-items: center; /* 垂直居中 */
  padding: 8px 15px; /* 内边距 */
  background-color: #e9edf2; /* 头部背景色，比主体稍深 */
  border-bottom: 1px solid #dcdfe6; /* 底部边框 */
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  cursor: grab; /* 提示可拖动 */
}

.labeling-dialog-header .el-button {
  padding: 0; /* 移除按钮默认内边距 */
  width: 24px; /* 固定按钮宽度 */
  height: 24px; /* 固定按钮高度 */
  font-size: 16px;
  border: none; /* 移除边框 */
  background: none; /* 移除背景 */
}

.labeling-dialog-header .el-button:hover {
  background-color: #f56c6c; /* 鼠标悬停时背景色 */
  color: #fff; /* 鼠标悬停时文字颜色 */
}
</style>
