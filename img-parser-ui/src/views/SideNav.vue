<template>
  <div>
    <el-tree
      ref="treeRef"
      :data="treeData"
      :props="defaultProps"
      node-key="id"
      default-expand-all
      show-checkbox
      check-strictly
      highlight-current
      :default-checked-keys="defaultCheckedKeys"
      @check-change="onCheckChange"
      @node-click="onNodeClick"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useMainStore } from '@/store/main'

const store = useMainStore()
const treeRef = ref()

const defaultProps = {
  children: 'children',
  label: 'label',
  disabled: (data) => false, // 控制点击行为不禁用
}

const treeData = computed(() => [
  {
    id: 'layers',
    label: '图层',
    disableCheckbox: true,
    children: store.layers.map((layer) => ({
      id: layer.uid,
      label: layer.label,
      disableCheckbox: true,
      children: [
        {
          id: `${layer.uid}-mask`,
          label: '显示遮罩',
          isControl: true,
          type: 'mask',
        },
        {
          id: `${layer.uid}-bbox`,
          label: '显示边界框',
          isControl: true,
          type: 'bbox',
        }
      ]
    }))
  }
])

const defaultCheckedKeys = computed(() => {
  const keys = ['layers', ...store.layers.map(l => l.uid)]
  for (const layer of store.layers) {
    if (layer.showMask) keys.push(`${layer.uid}-mask`)
    if (layer.showBBox) keys.push(`${layer.uid}-bbox`)
  }
  return keys
})

function onCheckChange(data, checked) {
  if (!data.isControl) return
  const layer = store.layers.find(l => data.id.startsWith(l.uid))
  if (!layer) return
  if (data.type === 'mask') layer.showMask = checked
  if (data.type === 'bbox') layer.showBBox = checked
}

function onNodeClick(node) {
  if (!node.isControl && node.id && node.id !== 'layers') {
    store.selectLayer(node.id)
  }
}

// 初始化勾选
onMounted(() => {
  treeRef.value?.setCheckedKeys(defaultCheckedKeys.value)
})

// 响应 store 状态变化刷新 checkbox
watch(defaultCheckedKeys, (newKeys) => {
  treeRef.value?.setCheckedKeys(newKeys)
})
</script>
