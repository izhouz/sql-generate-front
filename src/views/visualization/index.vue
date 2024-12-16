<template>
  <page-container>
    <template #header>
      <div class="page-header">
        <h2>数据可视化</h2>
        <p class="description">
          通过图表和关系图直观展示数据库结构和操作统计信息
        </p>
      </div>
    </template>

    <el-tabs v-model="activeTab" class="visualization-tabs">
      <el-tab-pane label="表关系图" name="relation">
        <div class="relation-graph-container">
          <table-relation-graph />
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="数据统计" name="statistics">
        <data-statistics />
      </el-tab-pane>
    </el-tabs>
  </page-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import TableRelationGraph from '@/components/visualization/TableRelationGraph.vue'
import DataStatistics from '@/components/visualization/DataStatistics.vue'

const activeTab = ref('relation')
</script>

<style lang="scss" scoped>
.page-header {
  .description {
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin-top: 8px;
  }
}

.visualization-tabs {
  :deep(.el-tabs__content) {
    padding: 20px 0;
  }
}

.relation-graph-container {
  height: calc(100vh - 300px);
  min-height: 500px;
}
</style> 