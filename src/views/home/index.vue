<template>
  <div class="page-container">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>表总数</span>
              <el-tag size="small">今日</el-tag>
            </div>
          </template>
          <div class="card-body">
            <div class="number">{{ stats.tableCount }}</div>
            <div class="trend">
              <span :class="{ 'up': stats.tableIncrease > 0, 'down': stats.tableIncrease < 0 }">
                {{ stats.tableIncrease > 0 ? '+' : '' }}{{ stats.tableIncrease }}
              </span>
              <span class="label">较昨日</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>字段总数</span>
              <el-tag size="small" type="success">总计</el-tag>
            </div>
          </template>
          <div class="card-body">
            <div class="number">{{ stats.fieldCount }}</div>
            <div class="trend">
              <span :class="{ 'up': stats.fieldIncrease > 0, 'down': stats.fieldIncrease < 0 }">
                {{ stats.fieldIncrease > 0 ? '+' : '' }}{{ stats.fieldIncrease }}
              </span>
              <span class="label">较昨日</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>生成SQL数</span>
              <el-tag size="small" type="warning">本周</el-tag>
            </div>
          </template>
          <div class="card-body">
            <div class="number">{{ stats.sqlCount }}</div>
            <div class="trend">
              <span :class="{ 'up': stats.sqlIncrease > 0, 'down': stats.sqlIncrease < 0 }">
                {{ stats.sqlIncrease > 0 ? '+' : '' }}{{ stats.sqlIncrease }}
              </span>
              <span class="label">较上周</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>生成报告数</span>
              <el-tag size="small" type="info">本月</el-tag>
            </div>
          </template>
          <div class="card-body">
            <div class="number">{{ stats.reportCount }}</div>
            <div class="trend">
              <span :class="{ 'up': stats.reportIncrease > 0, 'down': stats.reportIncrease < 0 }">
                {{ stats.reportIncrease > 0 ? '+' : '' }}{{ stats.reportIncrease }}
              </span>
              <span class="label">较上月</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <!-- 最近活动 -->
      <el-col :span="16">
        <el-card class="activity-card">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
              <el-button link @click="handleRefresh">刷新</el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="activity in activities"
              :key="activity.id"
              :timestamp="formatDate(activity.time)"
              :type="getActivityType(activity.type)"
            >
              {{ activity.content }}
              <template v-if="activity.extra">
                <el-link type="primary" class="ml-2" @click="handleViewDetail(activity)">
                  查看详情
                </el-link>
              </template>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <!-- 快捷操作 -->
      <el-col :span="8">
        <el-card class="quick-actions">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="action-list">
            <el-button
              v-for="action in quickActions"
              :key="action.key"
              :type="action.type"
              :icon="action.icon"
              class="action-btn"
              @click="handleQuickAction(action)"
            >
              {{ action.label }}
            </el-button>
          </div>
        </el-card>

        <el-card class="todo-list mt-4">
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
              <el-button link @click="handleAddTodo">添加</el-button>
            </div>
          </template>
          <el-empty v-if="todos.length === 0" description="暂无待办事项" />
          <el-checkbox-group v-else v-model="completedTodos">
            <div v-for="todo in todos" :key="todo.id" class="todo-item">
              <el-checkbox :label="todo.id">{{ todo.content }}</el-checkbox>
              <span class="todo-time">{{ formatDate(todo.time) }}</span>
            </div>
          </el-checkbox-group>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Document,
  Plus,
  Upload,
  Download,
  Setting
} from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'

// 路由
const router = useRouter()

// 统计数据
const stats = reactive({
  tableCount: 0,
  tableIncrease: 0,
  fieldCount: 0,
  fieldIncrease: 0,
  sqlCount: 0,
  sqlIncrease: 0,
  reportCount: 0,
  reportIncrease: 0
})

// 活动列表
const activities = ref([
  {
    id: 1,
    type: 'success',
    content: '成功生成订单表 SQL',
    time: new Date(),
    extra: { type: 'sql', id: 1 }
  },
  {
    id: 2,
    type: 'warning',
    content: '修改用户表结构',
    time: new Date(Date.now() - 3600000),
    extra: { type: 'table', id: 2 }
  }
])

// 快捷操作
const quickActions = [
  {
    key: 'createTable',
    label: '新建表',
    type: 'primary',
    icon: Plus,
    route: '/table-designer'
  },
  {
    key: 'generateSql',
    label: '生成SQL',
    type: 'success',
    icon: Document,
    route: '/sql-generator'
  },
  {
    key: 'importTable',
    label: '导入表',
    type: 'warning',
    icon: Upload,
    route: '/table-designer'
  },
  {
    key: 'exportData',
    label: '导出数据',
    type: 'info',
    icon: Download,
    route: '/mock-data'
  },
  {
    key: 'settings',
    label: '系统设置',
    type: '',
    icon: Setting,
    route: '/settings'
  }
]

// 待办事项
const todos = ref([
  {
    id: 1,
    content: '完善用户表字段说明',
    time: new Date(),
    completed: false
  },
  {
    id: 2,
    content: '导出订单表结构',
    time: new Date(Date.now() - 3600000),
    completed: true
  }
])
const completedTodos = ref([2])

// 获取活动类型
const getActivityType = (type: string) => {
  const types: Record<string, string> = {
    success: 'success',
    warning: 'warning',
    error: 'danger',
    info: 'info'
  }
  return types[type] || 'primary'
}

// 处理快捷操作
const handleQuickAction = (action: typeof quickActions[0]) => {
  router.push(action.route)
}

// 处理查看详情
const handleViewDetail = (activity: typeof activities.value[0]) => {
  if (!activity.extra) return
  
  switch (activity.extra.type) {
    case 'sql':
      router.push(`/sql-generator?id=${activity.extra.id}`)
      break
    case 'table':
      router.push(`/table-designer?id=${activity.extra.id}`)
      break
    default:
      break
  }
}

// 处理添加待办
const handleAddTodo = () => {
  // TODO: 实现添加待办功能
  ElMessage.info('待实现')
}

// 处理刷新
const handleRefresh = () => {
  // TODO: 实现刷新功能
  ElMessage.success('刷新成功')
}

// 初始化
onMounted(() => {
  // TODO: 加载统计数据
})
</script>

<style lang="scss" scoped>
.stat-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .card-body {
    text-align: center;
    
    .number {
      font-size: 24px;
      font-weight: bold;
      color: var(--el-text-color-primary);
      margin: 10px 0;
    }
    
    .trend {
      font-size: 14px;
      
      .up {
        color: #67c23a;
      }
      
      .down {
        color: #f56c6c;
      }
      
      .label {
        color: var(--el-text-color-secondary);
        margin-left: 8px;
      }
    }
  }
}

.activity-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.quick-actions {
  .action-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    
    .action-btn {
      width: 100%;
    }
  }
}

.todo-list {
  .todo-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    
    &:last-child {
      border-bottom: none;
    }
    
    .todo-time {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}

.mt-4 {
  margin-top: 16px;
}

.ml-2 {
  margin-left: 8px;
}
</style> 