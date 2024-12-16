<template>
  <div class="data-statistics">
    <div class="toolbar">
      <el-space>
        <data-refresh :on-refresh="refreshAllCharts" />
        <el-button-group>
          <el-button :icon="Download" @click="exportAllToExcel">导出全部</el-button>
          <el-button :icon="Setting" @click="showGlobalConfig">全局配置</el-button>
        </el-button-group>
      </el-space>
    </div>

    <el-row :gutter="20">
      <!-- 表数量统计 -->
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>数据库引擎分布</span>
              <div class="header-right">
                <el-dropdown @command="(cmd) => handleExport(cmd, 'table')">
                  <el-button link>
                    导出
                    <el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="excel">导出到 Excel</el-dropdown-item>
                      <el-dropdown-item command="image">导出为图片</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-tooltip content="刷新" placement="top">
                  <el-button circle :icon="Refresh" @click="loadTableStats" />
                </el-tooltip>
              </div>
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
              <div class="header-right">
                <el-dropdown @command="(cmd) => handleExport(cmd, 'field')">
                  <el-button link>
                    导出
                    <el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="excel">导出到 Excel</el-dropdown-item>
                      <el-dropdown-item command="image">导出为图片</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-tooltip content="刷新" placement="top">
                  <el-button circle :icon="Refresh" @click="loadFieldStats" />
                </el-tooltip>
              </div>
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
              <div class="header-right">
                <el-dropdown @command="(cmd) => handleExport(cmd, 'operation')">
                  <el-button link>
                    导出
                    <el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="excel">导出到 Excel</el-dropdown-item>
                      <el-dropdown-item command="image">导出为图片</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-tooltip content="刷新" placement="top">
                  <el-button circle :icon="Refresh" @click="loadOperationStats" />
                </el-tooltip>
              </div>
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
              <div class="header-right">
                <el-dropdown @command="(cmd) => handleExport(cmd, 'relation')">
                  <el-button link>
                    导出
                    <el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="excel">导出到 Excel</el-dropdown-item>
                      <el-dropdown-item command="image">导出为图片</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-tooltip content="刷新" placement="top">
                  <el-button circle :icon="Refresh" @click="loadRelationStats" />
                </el-tooltip>
              </div>
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
                  <el-radio-button label="week">最��一周</el-radio-button>
                  <el-radio-button label="month">最近一月</el-radio-button>
                </el-radio-group>
                <el-dropdown @command="(cmd) => handleExport(cmd, 'trend')">
                  <el-button link>
                    导出
                    <el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="excel">导出到 Excel</el-dropdown-item>
                      <el-dropdown-item command="image">导出为图片</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
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

    <chart-config
      ref="chartConfigRef"
      :type="currentChartType"
      :initial-config="chartConfigs[currentChartType]"
      @update="handleConfigUpdate"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Refresh, ArrowDown, Download, Setting } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { EChartsType, EChartsOption } from 'echarts'
import { useTableInfoStore } from '@/store/modules/tableInfo'
import { useFieldInfoStore } from '@/store/modules/fieldInfo'
import { ElMessage } from 'element-plus'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import ChartConfig from './ChartConfig.vue'
import DataRefresh from './DataRefresh.vue'

interface ChartData {
  name: string
  value: number
}

interface TrendData {
  query: number[]
  create: number[]
  update: number[]
  delete: number[]
}

interface ExportData {
  tableStats: ChartData[]
  fieldStats: ChartData[]
  operationStats: ChartData[]
  relationStats: { name: string; relations: number }[]
  trendStats: TrendData
}

// 状态
const tableStatsChart = ref<HTMLElement>()
const fieldStatsChart = ref<HTMLElement>()
const operationStatsChart = ref<HTMLElement>()
const relationStatsChart = ref<HTMLElement>()
const trendStatsChart = ref<HTMLElement>()
const trendRange = ref<'week' | 'month'>('week')

let tableStats: EChartsType
let fieldStats: EChartsType
let operationStats: EChartsType
let relationStats: EChartsType
let trendStats: EChartsType

const tableStore = useTableInfoStore()
const fieldStore = useFieldInfoStore()

// 添加状态变量
const engineStats = ref<Record<string, number>>({})
const typeStats = ref<Record<string, number>>({})
const operationData = ref<ChartData[]>([])
const relationData = ref<{ name: string; relations: number }[]>([])

const chartConfigRef = ref()
const currentChartType = ref<'pie' | 'bar' | 'line'>('pie')
const chartConfigs = ref<Record<string, any>>({
  table: {
    type: 'pie',
    theme: 'default',
    animation: true,
    radius: 70,
    colorScheme: 'default',
    labels: ['name', 'value'],
    legendPosition: 'right'
  },
  field: {
    type: 'pie',
    theme: 'default',
    animation: true,
    radius: 70,
    roseType: true,
    colorScheme: 'warm',
    labels: ['name', 'value', 'percent'],
    legendPosition: 'right'
  },
  operation: {
    type: 'bar',
    theme: 'default',
    animation: true,
    direction: 'horizontal',
    stack: false,
    colorScheme: 'cold',
    labels: ['value'],
    legendPosition: 'top'
  },
  relation: {
    type: 'bar',
    theme: 'default',
    animation: true,
    direction: 'vertical',
    stack: false,
    colorScheme: 'nature',
    labels: ['value'],
    legendPosition: 'top'
  },
  trend: {
    type: 'line',
    theme: 'default',
    animation: true,
    smooth: true,
    area: true,
    colorScheme: 'default',
    labels: ['value'],
    legendPosition: 'top'
  }
})

// 添加配置按钮到工具栏
const toolbarButtons = computed(() => [
  {
    icon: 'Setting',
    tooltip: '配置',
    handler: (type: string) => {
      currentChartType.value = chartConfigs.value[type].type
      chartConfigRef.value?.show()
    }
  },
  {
    icon: 'Refresh',
    tooltip: '刷新',
    handler: (type: string) => {
      switch (type) {
        case 'table':
          loadTableStats()
          break
        case 'field':
          loadFieldStats()
          break
        case 'operation':
          loadOperationStats()
          break
        case 'relation':
          loadRelationStats()
          break
        case 'trend':
          loadTrendStats()
          break
      }
    }
  }
])

// 处理配置更新
const handleConfigUpdate = (config: any) => {
  const type = Object.keys(chartConfigs.value).find(
    key => chartConfigs.value[key].type === currentChartType.value
  )
  if (type) {
    chartConfigs.value[type] = {
      ...chartConfigs.value[type],
      ...config
    }
    // 重新加载对应的图表
    switch (type) {
      case 'table':
        loadTableStats()
        break
      case 'field':
        loadFieldStats()
        break
      case 'operation':
        loadOperationStats()
        break
      case 'relation':
        loadRelationStats()
        break
      case 'trend':
        loadTrendStats()
        break
    }
  }
}

// 更新图表配置应用
const applyChartConfig = (option: EChartsOption, type: string): EChartsOption => {
  const config = chartConfigs.value[type]
  const colors = {
    default: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
    warm: ['#ff7f50', '#ff6b6b', '#ffd93d', '#ff8c42', '#ff665a', '#ff8066', '#ffb88c', '#ffa07a', '#ff9b6b'],
    cold: ['#4facfe', '#00f2fe', '#38f9d7', '#43e97b', '#30cfd0', '#0396ff', '#45b7d1', '#56d4e0', '#4481eb'],
    nature: ['#96e6a1', '#66a6ff', '#89f7fe', '#a8edea', '#81fbb8', '#6dd5ed', '#85ffbd', '#b8f2e6', '#aff1da']
  }

  return {
    ...option,
    color: colors[config.colorScheme as keyof typeof colors],
    animation: config.animation,
    legend: {
      ...option.legend,
      show: true,
      position: config.legendPosition
    },
    series: option.series?.map(series => ({
      ...series,
      label: {
        ...series.label,
        show: config.labels.length > 0,
        formatter: (params: any) => {
          const parts = []
          if (config.labels.includes('name')) {
            parts.push(params.name)
          }
          if (config.labels.includes('value')) {
            parts.push(params.value)
          }
          if (config.labels.includes('percent') && params.percent) {
            parts.push(`${params.percent}%`)
          }
          return parts.join('\n')
        }
      },
      ...(config.type === 'pie' && {
        radius: `${config.radius}%`,
        roseType: config.roseType ? 'radius' : false
      }),
      ...(config.type === 'bar' && {
        stack: config.stack ? 'total' : undefined
      }),
      ...(config.type === 'line' && {
        smooth: config.smooth,
        areaStyle: config.area ? {} : undefined
      })
    }))
  }
}

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
  engineStats.value = tables.reduce((acc, table) => {
    acc[table.engine] = (acc[table.engine] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const option = applyChartConfig({
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
        data: Object.entries(engineStats.value).map(([name, value]) => ({
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
  }, 'table')
  tableStats.setOption(option)
}

// 加载字段类型统计
const loadFieldStats = async () => {
  const fields = await fieldStore.getFieldList()
  typeStats.value = fields.reduce((acc, field) => {
    acc[field.type] = (acc[field.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const option = applyChartConfig({
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
        data: Object.entries(typeStats.value).map(([name, value]) => ({
          name,
          value
        }))
      }
    ]
  }, 'field')
  fieldStats.setOption(option)
}

// 加载操作统计
const loadOperationStats = () => {
  operationData.value = [
    { name: '查询', value: 150 },
    { name: '新增', value: 50 },
    { name: '修改', value: 30 },
    { name: '删除', value: 10 }
  ]

  const option = applyChartConfig({
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
      data: operationData.value.map(item => item.name)
    },
    series: [
      {
        type: 'bar',
        data: operationData.value.map(item => item.value)
      }
    ]
  }, 'operation')
  operationStats.setOption(option)
}

// 加载表关系统计
const loadRelationStats = async () => {
  const tables = await tableStore.getTableList()
  relationData.value = tables.map(table => ({
    name: table.name,
    relations: table.fields.filter(field => field.foreignKey).length
  }))

  const option = applyChartConfig({
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
      data: relationData.value.map(item => item.name),
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
        data: relationData.value.map(item => item.relations)
      }
    ]
  }, 'relation')
  relationStats.setOption(option)
}

// 加载趋势统计
const loadTrendStats = () => {
  const days = trendRange.value === 'week' ? 7 : 30
  const dates = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toLocaleDateString()
  }).reverse()

  const data: TrendData = {
    query: Array.from({ length: days }, () => Math.floor(Math.random() * 100)),
    create: Array.from({ length: days }, () => Math.floor(Math.random() * 30)),
    update: Array.from({ length: days }, () => Math.floor(Math.random() * 20)),
    delete: Array.from({ length: days }, () => Math.floor(Math.random() * 10))
  }

  const option = applyChartConfig({
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
  }, 'trend')
  trendStats.setOption(option)
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

// 导出到 Excel
const exportToExcel = (type: string) => {
  try {
    let data: any[] = []
    let filename = '数据统计'

    switch (type) {
      case 'table':
        data = Object.entries(engineStats.value).map(([name, value]) => ({ name, value }))
        filename = '数据库引擎分布'
        break
      case 'field':
        data = Object.entries(typeStats.value).map(([name, value]) => ({ name, value }))
        filename = '字段类型分布'
        break
      case 'operation':
        data = operationData.value
        filename = '操作统计'
        break
      case 'relation':
        data = relationData.value
        filename = '表关系统计'
        break
      case 'trend':
        data = Object.entries(trendData.value).map(([key, values]) => ({
          type: key,
          values: values.join(',')
        }))
        filename = '操作趋势'
        break
      case 'all':
        const wb = XLSX.utils.book_new()
        
        // 添加所有sheet
        const sheets = [
          { name: '数据库引擎分布', data: Object.entries(engineStats.value).map(([name, value]) => ({ name, value })) },
          { name: '字段类型分布', data: Object.entries(typeStats.value).map(([name, value]) => ({ name, value })) },
          { name: '操作统计', data: operationData.value },
          { name: '表关系统计', data: relationData.value },
          { name: '操作趋势', data: Object.entries(trendData.value).map(([key, values]) => ({
            type: key,
            values: values.join(',')
          })) }
        ]

        sheets.forEach(sheet => {
          const ws = XLSX.utils.json_to_sheet(sheet.data)
          XLSX.utils.book_append_sheet(wb, ws, sheet.name)
        })

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '数据统计报告.xlsx')
        ElMessage.success('导出成功')
        return
    }

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, filename)
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${filename}.xlsx`)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败')
  }
}

// 导出为图片
const exportToImage = async (chartRef: HTMLElement | undefined, type: string) => {
  if (!chartRef) return
  
  try {
    const canvas = await html2canvas(chartRef)
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${type}统计图表.png`)
        ElMessage.success('导出成功')
      }
    })
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败')
  }
}

// 处理导出
const handleExport = (command: string, type: string) => {
  switch (command) {
    case 'excel':
      exportToExcel(type)
      break
    case 'image':
      const chartRef = (() => {
        switch (type) {
          case 'table':
            return tableStatsChart.value
          case 'field':
            return fieldStatsChart.value
          case 'operation':
            return operationStatsChart.value
          case 'relation':
            return relationStatsChart.value
          case 'trend':
            return trendStatsChart.value
          default:
            return undefined
        }
      })()
      exportToImage(chartRef, type)
      break
  }
}

// 添加刷新所有图表的方法
const refreshAllCharts = async () => {
  await Promise.all([
    loadTableStats(),
    loadFieldStats(),
    loadOperationStats(),
    loadRelationStats(),
    loadTrendStats()
  ])
}

// 导出所有数据到 Excel
const exportAllToExcel = () => {
  exportToExcel('all')
}

// 显示全局配置
const showGlobalConfig = () => {
  currentChartType.value = 'pie'
  chartConfigRef.value?.show()
}
</script>

<style lang="scss" scoped>
.data-statistics {
  padding: 20px;

  .toolbar {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-end;
  }

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