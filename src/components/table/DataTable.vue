<template>
  <div class="data-table">
    <div class="table-header" v-if="title || $slots.header">
      <slot name="header">
        <div class="title">{{ title }}</div>
      </slot>
    </div>
    
    <div class="table-toolbar" v-if="showToolbar">
      <div class="left">
        <slot name="toolbar-left">
          <el-button
            v-if="showRefresh"
            :loading="loading"
            circle
            @click="handleRefresh"
          >
            <el-icon><Refresh /></el-icon>
          </el-button>
          
          <el-button
            v-if="showDensity"
            circle
            @click="toggleDensity"
          >
            <el-icon><Grid /></el-icon>
          </el-button>
        </slot>
      </div>
      
      <div class="right">
        <slot name="toolbar-right">
          <el-input
            v-if="showSearch"
            v-model="searchText"
            placeholder="搜索..."
            clearable
            prefix-icon="Search"
            class="search-input"
          />
        </slot>
      </div>
    </div>
    
    <el-table
      ref="tableRef"
      v-bind="$attrs"
      :data="filteredData"
      :size="density"
      :border="border"
      :stripe="stripe"
      v-loading="loading"
    >
      <slot />
      
      <template #empty>
        <slot name="empty">
          <el-empty description="暂无数据" />
        </slot>
      </template>
    </el-table>
    
    <div class="table-footer" v-if="showPagination">
      <slot name="footer">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="pageSizes"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { Refresh, Grid, Search } from '@element-plus/icons-vue'
import type { TableInstance } from 'element-plus'

interface Props {
  title?: string
  data?: any[]
  loading?: boolean
  border?: boolean
  stripe?: boolean
  showToolbar?: boolean
  showRefresh?: boolean
  showSearch?: boolean
  showDensity?: boolean
  showPagination?: boolean
  pageSizes?: number[]
  defaultPageSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  data: () => [],
  loading: false,
  border: true,
  stripe: true,
  showToolbar: true,
  showRefresh: true,
  showSearch: true,
  showDensity: true,
  showPagination: true,
  pageSizes: () => [10, 20, 50, 100],
  defaultPageSize: 10
})

const emit = defineEmits(['refresh', 'search', 'page-change', 'size-change'])

// 表格实例
const tableRef = ref<TableInstance>()

// 搜索文本
const searchText = ref('')

// 表格密度
const density = ref<'large' | 'default' | 'small'>('default')

// 分页
const currentPage = ref(1)
const pageSize = ref(props.defaultPageSize)
const total = computed(() => filteredData.value.length)

// 过滤后的数据
const filteredData = computed(() => {
  let result = [...props.data]
  
  // 搜索过滤
  if (searchText.value) {
    const searchValue = searchText.value.toLowerCase()
    result = result.filter(item => {
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchValue)
      )
    })
  }
  
  // 分页
  if (props.showPagination) {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    result = result.slice(start, end)
  }
  
  return result
})

// 刷新
const handleRefresh = () => {
  emit('refresh')
}

// 切换密度
const toggleDensity = () => {
  const sizes: Array<'large' | 'default' | 'small'> = ['large', 'default', 'small']
  const currentIndex = sizes.indexOf(density.value)
  density.value = sizes[(currentIndex + 1) % sizes.length]
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  emit('page-change', page)
}

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  emit('size-change', size)
}

// 导出方法
defineExpose({
  tableRef,
  refresh: handleRefresh,
  clearSearch: () => searchText.value = '',
  resetPagination: () => {
    currentPage.value = 1
    pageSize.value = props.defaultPageSize
  }
})
</script>

<style lang="scss" scoped>
.data-table {
  .table-header {
    margin-bottom: 16px;
    
    .title {
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }
  
  .table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .search-input {
      width: 200px;
    }
  }
  
  .table-footer {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style> 