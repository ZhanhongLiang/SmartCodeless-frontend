<!--
 * @Author: jean cw252128385@gmail.com
 * @Date: 2026-03-20 14:18:41
 * @LastEditors: jean cw252128385@gmail.com
 * @LastEditTime: 2026-03-26 15:45:32
 * @FilePath: \ai-code-mother-scratch-frontend\src\layouts\BasicLayout.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <a-layout class="basic-layout">
    <!-- 顶部导航栏 -->
    <GlobalHeader />
    <!-- 主要内容区域 -->
    <a-layout-content class="main-content">
      <router-view />
    </a-layout-content>
    <!-- 底部版权信息 -->
    <GlobalFooter />
  </a-layout>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalFooter from '@/components/GlobalFooter.vue'
</script>

<style scoped>
.basic-layout {
  background: none;
}

.main-content {
  /* max-width: 1200px; */
  width: 100%;
  /* padding: 24px;
  background: white;
  margin: 16px auto 56px; */
  padding: 0;
  background: none;
  margin: 0;
}
</style>
