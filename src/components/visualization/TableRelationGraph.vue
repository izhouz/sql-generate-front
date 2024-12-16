<template>
  <div class="table-relation-graph">
    <div class="toolbar">
      <el-button-group>
        <el-button :icon="ZoomIn" @click="handleZoomIn">放大</el-button>
        <el-button :icon="ZoomOut" @click="handleZoomOut">缩小</el-button>
        <el-button :icon="RefreshRight" @click="handleFitView">适应画布</el-button>
      </el-button-group>

      <el-button-group>
        <el-button :icon="Plus" @click="handleExpandAll">展开全部</el-button>
        <el-button :icon="Minus" @click="handleCollapseAll">折叠全部</el-button>
      </el-button-group>

      <el-select v-model="layout" placeholder="布局方式" @change="handleLayoutChange">
        <el-option label="力导向布局" value="force" />
        <el-option label="环形布局" value="circular" />
        <el-option label="分层布局" value="hierarchical" />
      </el-select>
    </div>

    <div ref="container" class="graph-container"></div>

    <!-- 表详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="表详情"
      size="500px"
      destroy-on-close
    >
      <template v-if="selectedTable">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="表名">
            {{ selectedTable.name }}
          </el-descriptions-item>
          <el-descriptions-item label="注释">
            {{ selectedTable.comment || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="引擎">
            {{ selectedTable.engine }}
          </el-descriptions-item>
          <el-descriptions-item label="字符集">
            {{ selectedTable.charset }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="table-fields">
          <h4>字段列表</h4>
          <el-table :data="selectedTable.fields" border stripe>
            <el-table-column prop="name" label="字段名" />
            <el-table-column prop="type" label="类型" />
            <el-table-column prop="comment" label="注释" show-overflow-tooltip />
            <el-table-column label="属性" width="180">
              <template #default="{ row }">
                <el-tag v-if="row.primaryKey" size="small">主键</el-tag>
                <el-tag v-if="row.foreignKey" type="success" size="small">外键</el-tag>
                <el-tag v-if="!row.nullable" type="warning" size="small">非空</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Graph, Util } from '@antv/g6'
import { ZoomIn, ZoomOut, RefreshRight, Plus, Minus } from '@element-plus/icons-vue'
import { useTableInfoStore } from '@/store/modules/tableInfo'
import type { Table } from '@/types/table'

const props = defineProps<{
  width?: number
  height?: number
}>()

// 状态
const container = ref<HTMLElement>()
const graph = ref<Graph>()
const layout = ref('force')
const drawerVisible = ref(false)
const selectedTable = ref<Table | null>(null)
const tableStore = useTableInfoStore()

// 图配置
const graphConfig = {
  container: container.value,
  width: props.width || 800,
  height: props.height || 600,
  modes: {
    default: ['drag-canvas', 'zoom-canvas', 'drag-node']
  },
  layout: {
    type: 'force',
    preventOverlap: true,
    linkDistance: 200
  },
  defaultNode: {
    type: 'rect',
    size: [120, 40],
    style: {
      fill: '#fff',
      stroke: '#40a9ff',
      radius: 4
    },
    labelCfg: {
      style: {
        fill: '#333',
        fontSize: 12
      }
    }
  },
  defaultEdge: {
    type: 'cubic-horizontal',
    style: {
      stroke: '#91d5ff',
      endArrow: {
        path: 'M 0,0 L 8,4 L 8,-4 Z',
        fill: '#91d5ff'
      }
    },
    labelCfg: {
      style: {
        fill: '#666',
        fontSize: 10
      }
    }
  }
}

// 初始化图
const initGraph = () => {
  if (!container.value) return

  graph.value = new Graph({
    ...graphConfig,
    container: container.value
  })

  // 注册事件
  graph.value.on('node:click', (evt) => {
    const node = evt.item
    if (node) {
      const model = node.getModel()
      selectedTable.value = tableStore.getTableByName(model.id)
      drawerVisible.value = true
    }
  })

  // 加载数据
  loadGraphData()
}

// 加载图数据
const loadGraphData = async () => {
  if (!graph.value) return

  const tables = await tableStore.getTableList()
  const nodes: any[] = []
  const edges: any[] = []

  // 添加节点
  tables.forEach(table => {
    nodes.push({
      id: table.name,
      label: table.name,
      data: table
    })
  })

  // 添加边
  tables.forEach(table => {
    table.fields.forEach(field => {
      if (field.foreignKey) {
        const targetTable = tables.find(t => t.id === field.foreignKey?.tableId)
        if (targetTable) {
          edges.push({
            source: table.name,
            target: targetTable.name,
            label: `${field.name} -> ${field.foreignKey.fieldId}`
          })
        }
      }
    })
  })

  graph.value.data({
    nodes,
    edges
  })
  graph.value.render()
  graph.value.fitView()
}

// 处理布局变更
const handleLayoutChange = () => {
  if (!graph.value) return

  graph.value.updateLayout({
    type: layout.value,
    preventOverlap: true,
    ...(layout.value === 'force' ? { linkDistance: 200 } : {})
  })
}

// 缩放操作
const handleZoomIn = () => graph.value?.zoom(1.1)
const handleZoomOut = () => graph.value?.zoom(0.9)
const handleFitView = () => graph.value?.fitView()

// 展开/折叠操作
const handleExpandAll = () => {
  if (!graph.value) return
  const nodes = graph.value.getNodes()
  nodes.forEach(node => {
    graph.value?.expandCombo(node)
  })
}

const handleCollapseAll = () => {
  if (!graph.value) return
  const nodes = graph.value.getNodes()
  nodes.forEach(node => {
    graph.value?.collapseCombo(node)
  })
}

// 监听容器大小变化
const resizeObserver = new ResizeObserver(() => {
  if (container.value && graph.value) {
    const { width, height } = container.value.getBoundingClientRect()
    graph.value.changeSize(width, height)
    graph.value.fitView()
  }
})

// 生命周期
onMounted(() => {
  if (container.value) {
    initGraph()
    resizeObserver.observe(container.value)
  }
})

onUnmounted(() => {
  if (container.value) {
    resizeObserver.unobserve(container.value)
  }
  graph.value?.destroy()
})

// 监听数据变化
watch(() => tableStore.tableList, () => {
  loadGraphData()
}, { deep: true })
</script>

<style lang="scss" scoped>
.table-relation-graph {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .toolbar {
    padding: 16px;
    display: flex;
    gap: 16px;
    align-items: center;
    border-bottom: 1px solid var(--el-border-color-light);
  }
  
  .graph-container {
    flex: 1;
    min-height: 400px;
    background-color: #fafafa;
  }

  .table-fields {
    margin-top: 24px;
    
    h4 {
      margin: 0 0 16px;
      font-size: 16px;
      font-weight: 500;
    }
  }
}
</style> 