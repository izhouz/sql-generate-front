// 报告类型
export interface Report {
  id: number
  name: string
  type: 'TABLE' | 'FIELD' | 'SQL'
  content: string
  format: 'SQL' | 'JSON' | 'EXCEL'
  status: 'SUCCESS' | 'FAILED' | 'PROCESSING'
  error?: string
  createTime: string
  updateTime: string
}

// 报告查询参数
export interface ReportParams {
  name?: string
  type?: Report['type']
  status?: Report['status']
  startTime?: string
  endTime?: string
  pageSize?: number
  pageNum?: number
}

// 报告创建参数
export interface CreateReportParams {
  name: string
  type: Report['type']
  format: Report['format']
  tableIds?: number[]
  fieldIds?: number[]
  sqlContent?: string
}

// 报告更新参数
export interface UpdateReportParams {
  name?: string
  content?: string
  format?: Report['format']
  status?: Report['status']
  error?: string
}
