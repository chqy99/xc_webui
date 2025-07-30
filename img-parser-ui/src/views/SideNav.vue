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
const props = defineProps({
  layers: { type: Array, default: () => [] }
})
const emit = defineEmits(['select-layer'])

const defaultProps = {
  children: 'children',
  label: 'label'
}

const treeData = computed(() => [
  {
    id: 'layers',
    label: 'layers',
    children: props.layers.map((layer, idx) => ({
      id: layer.id || `layer${idx + 1}`,
      label: layer.label,
      url: layer.url,
      base64: layer.base64
    }))
  }
])

function onNodeClick(node) {
  if (node.id !== 'layers') {
    emit('select-layer', {
      id: node.id,
      label: node.label,
      url: node.url,
      base64: node.base64
    })
  }
}
</script>
