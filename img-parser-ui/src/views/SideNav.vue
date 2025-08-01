// src/views/SideNav.vue
<template>
  <div>
    <el-tree
      :data="treeData"
      :props="defaultProps"
      node-key="id"
      default-expand-all
      highlight-current
      @node-click="onNodeClick"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMainStore } from '@/store/main'
import eventBus from '@/utils/eventBus'
import { AppEvents } from '@/utils/eventTypes'

const store = useMainStore()

const defaultProps = {
  children: 'children',
  label: 'label'
}

// treeData 直接从 store 的 state 计算得出
const treeData = computed(() => [
  {
    id: 'layers',
    label: '图层',
    children: store.layers.map((layer) => ({
      id: layer.uid,
      label: layer.label,
    }))
  }
])

function onNodeClick(node) {
  // 节点有 id 且不是根节点时，发出选择图层事件
  if (node.id && node.id !== 'layers') {
    eventBus.emit(AppEvents.SELECT_LAYER, node.id)
  }
}
</script>
