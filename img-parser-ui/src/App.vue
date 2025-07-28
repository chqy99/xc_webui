<template>
  <el-container>
    <el-header height="60px">
      <h2>图像解析前端</h2>
      <el-menu mode="horizontal" router>
        <el-menu-item index="/parse">解析</el-menu-item>
        <el-menu-item index="/retrieval" disabled>检索（开发中）</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
</script>

<style scoped>
h2 {
  margin: 0;
  padding-right: 20px;
  display: inline-block;
}
</style>
