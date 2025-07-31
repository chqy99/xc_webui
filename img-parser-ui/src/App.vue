<template>
  <el-container style="height: 100vh;">
    <el-header height="60px" style="padding: 0;">
      <TopMenu @open-image="onOpenImage" @parse-request="onParseRequest"/>
    </el-header>

    <el-container style="flex: 1; overflow: hidden;">
      <el-aside :style="{ width: navWidth + 'px', minWidth: '150px', maxWidth: '400px', overflowY: 'auto', background: '#f5f7fa', padding: '10px' }">
        <SideNav :layers="layers" @select-layer="onSelectLayer" />
      </el-aside>

      <div @mousedown="startDrag('nav')" style="width: 6px; cursor: col-resize; background: #ddd;"></div>

      <el-container style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
        <!-- 画布区，上方flex自动撑满 -->
        <el-main
          :style="{ flex: canvasFlex, position: 'relative', overflow: 'auto', background: '#fff', padding: '10px' }"
          ref="canvasContainer"
        >
          <CanvasView :layer="selectedLayer" />
        </el-main>

        <!-- 拖拽条，调整画布和属性栏高度 -->
        <div
          @mousedown="startDrag('attr')"
          style="height: 6px; cursor: row-resize; background: #ddd;"
        ></div>

        <!-- 属性栏，高度可调 -->
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
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import TopMenu from '@/views/TopMenu.vue'
import SideNav from '@/views/SideNav.vue'
import CanvasView from '@/views/CanvasView.vue'
import AttributePanel from '@/views/AttributePanel.vue'
import { ElMessage } from 'element-plus'
import { uploadImage, parseImage } from '@/api/parser'

const navWidth = ref(250)
const attrHeight = ref(250)
const dragging = ref(null)
const startX = ref(0)
const startY = ref(0)
const startNavWidth = ref(0)
const startAttrHeight = ref(0)

// 计算画布flex，根据attrHeight动态调整
const canvasFlex = computed(() => {
  // el-container高度100vh，去掉header 60px和拖拽条6px
  const totalHeight = window.innerHeight - 60 - 6
  // 画布高度 = totalHeight - 属性栏高度
  const canvasHeight = totalHeight - attrHeight.value
  // 转换成flex值，比例即可
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
    const deltaY = startY.value - e.clientY // 往上拖是增加属性栏高度
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
    base64: image.base64
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
    uid: selectedLayer.value.uid,  // ✅ 使用 uid 而不是 base64
    mode,
    prompt
  })

  selectedLayer.value.units = data.units || []
}
</script>

<style scoped>
html,
body,
#app {
  height: 100%;
  margin: 0;
}
</style>
