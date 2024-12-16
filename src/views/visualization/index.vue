<template>
  <div class="visualization-page">
    <el-tabs v-model="activeTab" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="基础图表" name="basic">
        <router-view v-if="activeTab === 'basic'" />
      </el-tab-pane>
      <el-tab-pane label="高级图表" name="advanced">
        <router-view v-if="activeTab === 'advanced'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const activeTab = ref('basic')

// 根据路由更新当前标签
watch(() => route.path, (path) => {
  if (path.includes('advanced')) {
    activeTab.value = 'advanced'
  } else {
    activeTab.value = 'basic'
  }
}, { immediate: true })

// 处理标签切换
const handleClick = () => {
  router.push(`/visualization/${activeTab.value}`)
}
</script>

<style lang="scss" scoped>
.visualization-page {
  padding: 20px;
  
  :deep(.el-tabs__content) {
    padding: 20px 0;
  }
}
</style> 