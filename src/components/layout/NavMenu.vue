<template>
  <el-menu
    :default-active="activeMenu"
    class="nav-menu"
    :collapse="isCollapse"
    @select="handleSelect"
  >
    <el-menu-item index="/home">
      <el-icon><House /></el-icon>
      <template #title>首页</template>
    </el-menu-item>

    <el-sub-menu index="table">
      <template #title>
        <el-icon><Grid /></el-icon>
        <span>表管理</span>
      </template>
      <el-menu-item index="/table-designer">表设计器</el-menu-item>
      <el-menu-item index="/mock-data">模拟数据</el-menu-item>
    </el-sub-menu>

    <el-sub-menu index="generate">
      <template #title>
        <el-icon><Document /></el-icon>
        <span>生成管理</span>
      </template>
      <el-menu-item index="/sql-generator">SQL生成</el-menu-item>
      <el-menu-item index="/report">报告管理</el-menu-item>
    </el-sub-menu>

    <el-menu-item index="/settings">
      <el-icon><Setting /></el-icon>
      <template #title>系统设置</template>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  House,
  Grid,
  Document,
  Setting
} from '@element-plus/icons-vue'

const props = defineProps<{
  isCollapse?: boolean
}>()

const route = useRoute()
const router = useRouter()

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 处理菜单选择
const handleSelect = (index: string) => {
  router.push(index)
}
</script>

<style lang="scss" scoped>
.nav-menu {
  height: 100%;
  border-right: none;
  
  :deep(.el-menu-item) {
    &.is-active {
      background-color: var(--el-menu-hover-bg-color);
    }
  }
  
  .el-menu-item [class^="el-icon-"] {
    margin-right: 5px;
    width: 24px;
    text-align: center;
    font-size: 18px;
  }
}
</style> 