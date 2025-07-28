<template>
  <div>
    <p>解析视觉图：</p>
    <img :src="mask || src" style="max-width: 100%; border: 1px solid #ccc;" />
  </div>
</template>

<script setup>
defineProps({
  src: String,
  mask: String
})
</script>
