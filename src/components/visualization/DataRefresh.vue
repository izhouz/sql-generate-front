<template>
  <div class="data-refresh">
    <el-popover
      placement="bottom"
      :width="300"
      trigger="click"
      popper-class="refresh-popover"
    >
      <template #reference>
        <el-button :icon="Timer" circle type="primary" plain />
      </template>

      <div class="refresh-settings">
        <h4>刷新设置</h4>
        
        <div class="setting-item">
          <span class="label">自动刷新</span>
          <el-switch v-model="autoRefresh" @change="handleAutoRefreshChange" />
        </div>

        <div class="setting-item" v-if="autoRefresh">
          <span class="label">刷新间隔</span>
          <el-select v-model="refreshInterval" placeholder="选择间隔" @change="handleIntervalChange">
            <el-option label="10 秒" :value="10" />
            <el-option label="30 秒" :value="30" />
            <el-option label="1 分钟" :value="60" />
            <el-option label="5 分钟" :value="300" />
            <el-option label="10 分钟" :value="600" />
          </el-select>
        </div>

        <div class="setting-item">
          <span class="label">上次刷新</span>
          <span class="time">{{ lastRefreshTime }}</span>
        </div>

        <div class="setting-item">
          <span class="label">下次刷新</span>
          <span class="time">{{ nextRefreshTime }}</span>
        </div>

        <div class="actions">
          <el-button type="primary" @click="handleManualRefresh">
            立即刷新
          </el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Timer } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const props = defineProps<{
  onRefresh: () => void | Promise<void>
}>()

const autoRefresh = ref(false)
const refreshInterval = ref(60)
const lastRefreshAt = ref<Date>(new Date())
const nextRefreshAt = ref<Date>(new Date())
let refreshTimer: number | null = null

// 格式化时间显示
const formatTime = (date: Date) => {
  return dayjs(date).format('HH:mm:ss')
}

const lastRefreshTime = computed(() => {
  if (!lastRefreshAt.value) return '从未'
  return dayjs(lastRefreshAt.value).fromNow()
})

const nextRefreshTime = computed(() => {
  if (!autoRefresh.value || !nextRefreshAt.value) return '-'
  return formatTime(nextRefreshAt.value)
})

// 处理自动刷新变更
const handleAutoRefreshChange = (value: boolean) => {
  if (value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

// 处理间隔变更
const handleIntervalChange = () => {
  if (autoRefresh.value) {
    restartAutoRefresh()
  }
}

// 开始自动刷新
const startAutoRefresh = () => {
  stopAutoRefresh()
  scheduleNextRefresh()
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (refreshTimer) {
    window.clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

// 重启自动刷新
const restartAutoRefresh = () => {
  stopAutoRefresh()
  startAutoRefresh()
}

// 调度下次刷新
const scheduleNextRefresh = () => {
  if (!autoRefresh.value) return

  const now = new Date()
  nextRefreshAt.value = new Date(now.getTime() + refreshInterval.value * 1000)
  
  refreshTimer = window.setTimeout(async () => {
    await refresh()
    scheduleNextRefresh()
  }, refreshInterval.value * 1000)
}

// 执行刷新
const refresh = async () => {
  try {
    await props.onRefresh()
    lastRefreshAt.value = new Date()
  } catch (error) {
    console.error('Refresh failed:', error)
  }
}

// 手动刷新
const handleManualRefresh = async () => {
  await refresh()
  if (autoRefresh.value) {
    restartAutoRefresh()
  }
}

// 生命周期
onMounted(() => {
  refresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})

// 暴露方法给父组件
defineExpose({
  refresh,
  startAutoRefresh,
  stopAutoRefresh
})
</script>

<style lang="scss" scoped>
.data-refresh {
  display: inline-block;
}

.refresh-settings {
  h4 {
    margin: 0 0 16px;
    font-size: 16px;
  }

  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .label {
      color: var(--el-text-color-regular);
    }

    .time {
      color: var(--el-text-color-secondary);
    }
  }

  .actions {
    margin-top: 20px;
    text-align: right;
  }
}
</style> 