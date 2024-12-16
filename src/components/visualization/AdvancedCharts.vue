<template>
  <div class="advanced-charts">
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
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>字段类型分布(散点图)</span>
              <div class="header-right">
                <el-dropdown @command="(cmd) => handleExport(cmd, 'scatter')">
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
                  <el-button circle :icon="Refresh" @click="loadScatterChart" />
                </el-tooltip>
              </div>
            </div>
          </template>
          <div ref="scatterChart" class="chart"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>表大小分布(雷达图)</span>
              <div class="header-right">
                <el-dropdown @command="(cmd) => handleExport(cmd, 'radar')">
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
                  <el-button circle :icon="Refresh" @click="loadRadarChart" />
                </el-tooltip>
              </div>
            </div>
          </template>
          <div ref="radarChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <el-col :span="24">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>数据库性能分析(漏斗图)</span>
              <div class="header-right">
                <el-dropdown @command="(cmd) => handleExport(cmd, 'funnel')">
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
                  <el-button circle :icon="Refresh" @click="loadFunnelChart" />
                </el-tooltip>
              </div>
            </div>
          </template>
          <div ref="funnelChart" class="chart chart-lg"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Refresh, ArrowDown, Download, Setting } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { EChartsType, EChartsOption } from 'echarts'
import { ElMessage } from 'element-plus'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import { useTableInfoStore } from '@/store/modules/tableInfo'
import { useFieldInfoStore } from '@/store/modules/fieldInfo'
import DataRefresh from './DataRefresh.vue'

// 图表引用
const scatterChart = ref<HTMLElement>()
const radarChart = ref<HTMLElement>()
const funnelChart = ref<HTMLElement>()

// ECharts 实例
let scatter: EChartsType
let radar: EChartsType
let funnel: EChartsType

// Store
const tableStore = useTableInfoStore()
const fieldStore = useFieldInfoStore()

// 数据状态
const scatterData = ref<Array<[number, number, string]>>([])
const radarData = ref<Array<{ name: string; value: number[] }>>([])
const funnelData = ref<Array<{ value: number; name: string }>>([])

// 初始化图表
const initCharts = () => {
  if (scatterChart.value) {
    scatter = echarts.init(scatterChart.value)
  }
  if (radarChart.value) {
    radar = echarts.init(radarChart.value)
  }
  if (funnelChart.value) {
    funnel = echarts.init(funnelChart.value)
  }
}

// 加载散点图
const loadScatterChart = async () => {
  const fields = await fieldStore.getFieldList()
  const typeGroups = fields.reduce((acc, field) => {
    if (!acc[field.type]) {
      acc[field.type] = []
    }
    acc[field.type].push(field)
    return acc
  }, {} as Record<string, any[]>)

  scatterData.value = Object.entries(typeGroups).flatMap(([type, fields], typeIndex) => 
    fields.map((field, fieldIndex) => [
      typeIndex,
      fieldIndex,
      type
    ] as [number, number, string])
  )

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => `类型: ${params.data[2]}`
    },
    xAxis: {
      name: '字段类型',
      type: 'value'
    },
    yAxis: {
      name: '字段数量',
      type: 'value'
    },
    series: [
      {
        type: 'scatter',
        data: scatterData.value,
        symbolSize: 10,
        emphasis: {
          focus: 'series'
        }
      }
    ]
  }

  scatter.setOption(option)
}

// 加载雷达图
const loadRadarChart = async () => {
  const tables = await tableStore.getTableList()
  const dimensions = ['字段数量', '外键数量', '索引数量', '约束数量', '触发器数量']
  
  radarData.value = tables.slice(0, 5).map(table => ({
    name: table.name,
    value: [
      table.fields.length,
      table.fields.filter(f => f.foreignKey).length,
      table.fields.filter(f => f.primaryKey).length,
      table.fields.filter(f => !f.nullable).length,
      0 // 触发器数量，需要后端支持
    ]
  }))

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: radarData.value.map(item => item.name)
    },
    radar: {
      indicator: dimensions.map(name => ({ name, max: 10 }))
    },
    series: [
      {
        type: 'radar',
        data: radarData.value
      }
    ]
  }

  radar.setOption(option)
}

// 加载漏斗图
const loadFunnelChart = async () => {
  const tables = await tableStore.getTableList()
  
  funnelData.value = [
    { value: tables.length, name: '总表数' },
    { value: tables.reduce((acc, t) => acc + t.fields.length, 0), name: '总字段数' },
    { value: tables.reduce((acc, t) => acc + t.fields.filter(f => f.primaryKey).length, 0), name: '主键数' },
    { value: tables.reduce((acc, t) => acc + t.fields.filter(f => f.foreignKey).length, 0), name: '外键数' },
    { value: tables.reduce((acc, t) => acc + t.fields.filter(f => !f.nullable).length, 0), name: '非空约束数' }
  ]

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}'
    },
    series: [
      {
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: Math.max(...funnelData.value.map(d => d.value)),
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside'
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 20
          }
        },
        data: funnelData.value
      }
    ]
  }

  funnel.setOption(option)
}

// 导出到 Excel
const exportToExcel = (type: string) => {
  try {
    let data: any[] = []
    let filename = '高级统计'

    switch (type) {
      case 'scatter':
        data = scatterData.value.map(([x, y, type]) => ({
          x,
          y,
          type
        }))
        filename = '字段类型分布'
        break
      case 'radar':
        data = radarData.value
        filename = '表大小分布'
        break
      case 'funnel':
        data = funnelData.value
        filename = '数据库性能分析'
        break
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
          case 'scatter':
            return scatterChart.value
          case 'radar':
            return radarChart.value
          case 'funnel':
            return funnelChart.value
          default:
            return undefined
        }
      })()
      exportToImage(chartRef, type)
      break
  }
}

// 处理窗口大小变化
const handleResize = () => {
  scatter?.resize()
  radar?.resize()
  funnel?.resize()
}

// 添加刷新所有图表的方法
const refreshAllCharts = async () => {
  await Promise.all([
    loadScatterChart(),
    loadRadarChart(),
    loadFunnelChart()
  ])
}

// 导出所有数据到 Excel
const exportAllToExcel = () => {
  const wb = XLSX.utils.book_new()
  
  // 添加所有sheet
  const sheets = [
    { name: '字段类型分布', data: scatterData.value.map(([x, y, type]) => ({ x, y, type })) },
    { name: '表大小分布', data: radarData.value },
    { name: '数据库性能分析', data: funnelData.value }
  ]

  sheets.forEach(sheet => {
    const ws = XLSX.utils.json_to_sheet(sheet.data)
    XLSX.utils.book_append_sheet(wb, ws, sheet.name)
  })

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '高级统计报告.xlsx')
  ElMessage.success('导出成功')
}

// 显示全局配置
const showGlobalConfig = () => {
  currentChartType.value = chartConfigs.value[Object.keys(chartConfigs.value)[0]].type
  chartConfigRef.value?.show()
}

// 生命周期
onMounted(() => {
  initCharts()
  loadScatterChart()
  loadRadarChart()
  loadFunnelChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  scatter?.dispose()
  radar?.dispose()
  funnel?.dispose()
})
</script>

<style lang="scss" scoped>
.advanced-charts {
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