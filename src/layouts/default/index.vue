<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
      <div class="logo">
        <img src="@/assets/logo.png" alt="Logo" />
        <span v-show="!isCollapse">SQL Generator</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        class="menu"
        @select="handleSelect"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        <el-menu-item index="/table-designer">
          <el-icon><Grid /></el-icon>
          <template #title>表设计器</template>
        </el-menu-item>
        <el-menu-item index="/sql-generator">
          <el-icon><Document /></el-icon>
          <template #title>SQL生成器</template>
        </el-menu-item>
        <el-menu-item index="/mock-data">
          <el-icon><DataLine /></el-icon>
          <template #title>模拟数据</template>
        </el-menu-item>
        <el-menu-item index="/report">
          <el-icon><Histogram /></el-icon>
          <template #title>报告管理</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 头部 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon
            class="collapse-btn"
            @click="isCollapse = !isCollapse"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb>
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="userInfo?.avatar" />
              <span class="username">{{ userInfo?.username }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主要内容区 -->
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { ElMessageBox } from 'element-plus'

// 状态
const isCollapse = ref(false)
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 计算属性
const activeMenu = computed(() => route.path)
const userInfo = computed(() => userStore.userInfo)

// 面包屑导航
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched.map(item => ({
    title: item.meta?.title,
    path: item.path
  }))
})

// 方法
const handleSelect = (index: string) => {
  router.push(index)
}

const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      // TODO: 跳转到个人信息页
      break
    case 'logout':
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await userStore.logout()
      router.push('/login')
      break
  }
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;

  .logo {
    height: var(--header-height);
    display: flex;
    align-items: center;
    padding: 0 20px;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    
    img {
      width: 32px;
      height: 32px;
      margin-right: 12px;
    }
  }

  .menu {
    border: none;
    background-color: transparent;
  }
}

.header {
  background-color: #fff;
  border-bottom: 1px solid var(--border-color-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;

  .header-left {
    display: flex;
    align-items: center;

    .collapse-btn {
      font-size: 20px;
      margin-right: 20px;
      cursor: pointer;
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;

      .username {
        margin-left: 8px;
        font-size: 14px;
      }
    }
  }
}

.main {
  background-color: var(--background-color);
  padding: 20px;
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 