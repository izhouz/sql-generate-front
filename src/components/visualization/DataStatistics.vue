<template>
  <div class="data-statistics">
    <el-row :gutter="20">
      <!-- 表数量统计 -->
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>表数量统计</span>
              <el-tooltip content="刷新" placement="top">
                <el-button circle :icon="Refresh" @click="loadTableStats" />
              </el-tooltip>
            </div>
          </template>
          <div ref="tableStatsChart" class="chart"></div>
        </el-card>
      </el-col>

      <!-- 字段类型分布 -->
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>字段类型分布</span>
              <el-tooltip content="刷新" placement="top">
                <el-button circle :icon="Refresh" @click="loadFieldStats" />
              </el-tooltip>
            </div>
          </template>
          <div ref="fieldStatsChart" class="chart"></div>
        </el-card>
      </el-col>

      <!-- 操作统计 -->
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>操作统计</span>
              <el-tooltip content="刷新" placement="top">
                <el-button circle :icon="Refresh" @click="loadOperationStats" />
              </el-tooltip>
            </div>
          </template>
          <div ref="operationStatsChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <!-- 表关系统计 -->
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>表关系统计</span>
              <el-tooltip content="刷新" placement="top">
                <el-button circle :icon="Refresh" @click="loadRelationStats" />
              </el-tooltip>
            </div>
          </template>
          <div ref="relationStatsChart" class="chart chart-lg"></div>
        </el-card>
      </el-col>

      <!-- 操作趋势 -->
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>操作趋势</span>
              <div class="header-right">
                <el-radio-group v-model="trendRange" size="small" @change="loadTrendStats">
                  <el-radio-button label="week">最近一周</el-radio-button>
                  <el-radio-button label="month">最近一月</el-radio-button>
                </el-radio-group>
                <el-tooltip content="刷新" placement="top">
                  <el-button circle :icon="Refresh" @click="loadTrendStats" />
                </el-tooltip>
              </div>
            </div>
          </template>
          <div ref="trendStatsChart" class="chart chart-lg"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useTableInfoStore } from '@/store/modules/tableInfo'
import { useFieldInfoStore } from '@/store/modules/fieldInfo'
import type { EChartsType } from 'echarts'

// 状态
const tableStatsChart = ref<HTMLElement>()
const fieldStatsChart = ref<HTMLElement>()
const operationStatsChart = ref<HTMLElement>()
const relationStatsChart = ref<HTMLElement>()
const trendStatsChart = ref<HTMLElement>()
const trendRange = ref<'week' | 'month'>('week')

const tableStore = useTableInfoStore()
const fieldStore = useFieldInfoStore()

// 图表实例
let tableStats: EChartsType
let fieldStats: EChartsType
let operationStats: EChartsType
let relationStats: EChartsType
let trendStats: EChartsType

// 初始化图表
const initCharts = () => {
  if (tableStatsChart.value) {
    tableStats = echarts.init(tableStatsChart.value)
  }
  if (fieldStatsChart.value) {
    fieldStats = echarts.init(fieldStatsChart.value)
  }
  if (operationStatsChart.value) {
    operationStats = echarts.init(operationStatsChart.value)
  }
  if (relationStatsChart.value) {
    relationStats = echarts.init(relationStatsChart.value)
  }
  if (trendStatsChart.value) {
    trendStats = echarts.init(trendStatsChart.value)
  }
}

// 加载表数量统计
const loadTableStats = async () => {
  const tables = await tableStore.getTableList()
  const engineStats = tables.reduce((acc, table) => {
    acc[table.engine] = (acc[table.engine] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  tableStats.setOption({
    title: {
      text: '数据库引擎分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: '70%',
        data: Object.entries(engineStats).map(([name, value]) => ({
          name,
          value
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })
}

// 加载字段类型统计
const loadFieldStats = async () => {
  const fields = await fieldStore.getFieldList()
  const typeStats = fields.reduce((acc, field) => {
    acc[field.type] = (acc[field.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  fieldStats.setOption({
    title: {
      text: '字段类型分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: Object.entries(typeStats).map(([name, value]) => ({
          name,
          value
        }))
      }
    ]
  })
}

// 加载操作统计
const loadOperationStats = () => {
  // 模拟数据
  const data = [
    { name: '查询', value: 150 },
    { name: '新增', value: 50 },
    { name: '修改', value: 30 },
    { name: '删除', value: 10 }
  ]

  operationStats.setOption({
    title: {
      text: '操作类型统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.name)
    },
    series: [
      {
        type: 'bar',
        data: data.map(item => item.value)
      }
    ]
  })
}

// 加载表关系统计
const loadRelationStats = async () => {
  const tables = await tableStore.getTableList()
  const relationData = tables.map(table => {
    const relations = table.fields.filter(field => field.foreignKey).length
    return {
      name: table.name,
      relations
    }
  })

  relationStats.setOption({
    title: {
      text: '表关系数量',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: relationData.map(item => item.name),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        type: 'bar',
        data: relationData.map(item => item.relations)
      }
    ]
  })
}

// 加载趋势统计
const loadTrendStats = () => {
  // 模拟数据
  const days = trendRange.value === 'week' ? 7 : 30
  const dates = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toLocaleDateString()
  }).reverse()

  const data = {
    query: Array.from({ length: days }, () => Math.floor(Math.random() * 100)),
    create: Array.from({ length: days }, () => Math.floor(Math.random() * 30)),
    update: Array.from({ length: days }, () => Math.floor(Math.random() * 20)),
    delete: Array.from({ length: days }, () => Math.floor(Math.random() * 10))
  }

  trendStats.setOption({
    title: {
      text: '操作趋势统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['查询', '新增', '修改', '删除'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '查询',
        type: 'line',
        data: data.query
      },
      {
        name: '新增',
        type: 'line',
        data: data.create
      },
      {
        name: '修改',
        type: 'line',
        data: data.update
      },
      {
        name: '删除',
        type: 'line',
        data: data.delete
      }
    ]
  })
}

// 监听窗口大小变化
const handleResize = () => {
  tableStats?.resize()
  fieldStats?.resize()
  operationStats?.resize()
  relationStats?.resize()
  trendStats?.resize()
}

// 生命周期
onMounted(() => {
  initCharts()
  loadTableStats()
  loadFieldStats()
  loadOperationStats()
  loadRelationStats()
  loadTrendStats()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  tableStats?.dispose()
  fieldStats?.dispose()
  operationStats?.dispose()
  relationStats?.dispose()
  trendStats?.dispose()
})
</script>

<style lang="scss" scoped>
.data-statistics {
  padding: 20px;

  .chart-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .chart {
      height: 300px;
      
      &.chart-lg {
        height: 400px;
      }
    }
  }

  .mt-4 {
    margin-top: 16px;
  }
}
</style> 