<template>
  <div class="page-container">
    <el-card class="report-manager">
      <template #header>
        <div class="flex justify-between items-center">
          <h3>报告管理</h3>
          <div>
            <el-button type="primary" @click="handleCreate">新建报告</el-button>
            <el-button @click="handleRefresh">刷新</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" class="search-form" inline>
        <el-form-item label="报告名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入报告名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="报告类型">
          <el-select v-model="searchForm.type" placeholder="请选择报告类型" clearable>
            <el-option label="表结构" value="TABLE" />
            <el-option label="字段信息" value="FIELD" />
            <el-option label="SQL语句" value="SQL" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="生成状态">
          <el-select v-model="searchForm.status" placeholder="请选择生成状态" clearable>
            <el-option label="生成成功" value="SUCCESS" />
            <el-option label="生成失败" value="FAILED" />
            <el-option label="生成中" value="PROCESSING" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        :data="reportList"
        border
        stripe
        v-loading="loading"
      >
        <el-table-column prop="name" label="报告名称" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="handleView(row)">{{ row.name }}</el-link>
          </template>
        </el-table-column>
        
        <el-table-column prop="type" label="报告类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ formatType(row.type) }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="format" label="文件格式" width="120">
          <template #default="{ row }">
            <el-tag type="info">{{ row.format }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleDownload(row)">下载</el-button>
            <el-button 
              link 
              type="danger" 
              @click="handleDelete(row)"
              :disabled="row.status === 'PROCESSING'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 查看报告对话框 -->
      <el-dialog
        v-model="viewDialogVisible"
        :title="currentReport?.name"
        width="60%"
      >
        <div v-if="currentReport" class="report-content">
          <div class="report-info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="报告类型">
                {{ formatType(currentReport.type) }}
              </el-descriptions-item>
              <el-descriptions-item label="文件格式">
                {{ currentReport.format }}
              </el-descriptions-item>
              <el-descriptions-item label="生成状态">
                <el-tag :type="getStatusType(currentReport.status)">
                  {{ formatStatus(currentReport.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ formatDate(currentReport.createTime) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
          
          <div class="report-preview">
            <code-editor
              v-model="currentReport.content"
              :mode="getEditorMode(currentReport.format)"
              height="400px"
              readonly
            />
          </div>
        </div>
        
        <template #footer>
          <el-button @click="viewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleDownload(currentReport)">下载</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useReportStore } from '@/store/modules/report'
import CodeEditor from '@/components/base/CodeEditor.vue'
import type { Report } from '@/types/report'

// 状态
const loading = ref(false)
const viewDialogVisible = ref(false)
const currentReport = ref<Report | null>(null)
const reportStore = useReportStore()

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  status: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const reportList = ref<Report[]>([])

// 格式化函数
const formatType = (type: string) => {
  const types: Record<string, string> = {
    TABLE: '表结构',
    FIELD: '字段信息',
    SQL: 'SQL语句'
  }
  return types[type] || type
}

const formatStatus = (status: string) => {
  const statuses: Record<string, string> = {
    SUCCESS: '生成成功',
    FAILED: '生成失败',
    PROCESSING: '生成中'
  }
  return statuses[status] || status
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    SUCCESS: 'success',
    FAILED: 'danger',
    PROCESSING: 'warning'
  }
  return types[status] || 'info'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

const getEditorMode = (format: string) => {
  const modes: Record<string, string> = {
    SQL: 'sql',
    JSON: 'json'
  }
  return modes[format] || 'text'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      type: searchForm.type || undefined,
      status: searchForm.status || undefined
    }
    const data = await reportStore.getReportList(params)
    reportList.value = data
    total.value = data.length
  } catch (error) {
    console.error('Load reports failed:', error)
    ElMessage.error('加载报告列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

// 处理重置
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    type: '',
    status: ''
  })
  handleSearch()
}

// 处理刷新
const handleRefresh = () => {
  loadData()
}

// 处理新建
const handleCreate = () => {
  // TODO: 实现新建报告功能
}

// 处理查看
const handleView = async (report: Report) => {
  try {
    const detail = await reportStore.getReportDetail(report.id)
    if (detail) {
      currentReport.value = detail
      viewDialogVisible.value = true
    }
  } catch (error) {
    console.error('Get report detail failed:', error)
    ElMessage.error('获取报告详��失败')
  }
}

// 处理下载
const handleDownload = async (report: Report) => {
  try {
    await reportStore.downloadReport(report.id)
    ElMessage.success('下载成功')
  } catch (error) {
    console.error('Download report failed:', error)
    ElMessage.error('下载失败')
  }
}

// 处理删除
const handleDelete = async (report: Report) => {
  try {
    await ElMessageBox.confirm('确定要删除该报告吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await reportStore.deleteReport(report.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete report failed:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 处理分页
const handleSizeChange = (size: number) => {
  pageSize.value = size
  loadData()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadData()
}

// 初始化
loadData()
</script>

<style lang="scss" scoped>
.report-manager {
  .search-form {
    margin-bottom: 24px;
  }
  
  .pagination {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }
  
  .report-content {
    .report-info {
      margin-bottom: 24px;
    }
  }
}
</style> 