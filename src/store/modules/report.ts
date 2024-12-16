import { defineStore } from 'pinia'
import { http } from '@/utils/request'

interface Report {
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

interface ReportState {
  reportList: Report[]
  currentReport: Report | null
  loading: boolean
}

export const useReportStore = defineStore('report', {
  state: (): ReportState => ({
    reportList: [],
    currentReport: null,
    loading: false
  }),

  getters: {
    getSuccessReports: (state) => {
      return state.reportList.filter(report => report.status === 'SUCCESS')
    },
    getFailedReports: (state) => {
      return state.reportList.filter(report => report.status === 'FAILED')
    }
  },

  actions: {
    // 获取报告列表
    async getReportList(params?: { type?: Report['type']; status?: Report['status'] }) {
      this.loading = true
      try {
        const data = await http.get<Report[]>('/api/report/list', { params })
        this.reportList = data
        return data
      } catch (error) {
        return []
      } finally {
        this.loading = false
      }
    },

    // 获取报告详情
    async getReportDetail(id: number) {
      try {
        const data = await http.get<Report>(`/api/report/${id}`)
        this.currentReport = data
        return data
      } catch (error) {
        return null
      }
    },

    // 创建报告
    async createReport(data: {
      name: string
      type: Report['type']
      content: string
      format: Report['format']
    }) {
      try {
        const result = await http.post<Report>('/api/report', data)
        this.reportList.push(result)
        return result
      } catch (error) {
        return null
      }
    },

    // 更新报告
    async updateReport(id: number, data: Partial<Report>) {
      try {
        const result = await http.put<Report>(`/api/report/${id}`, data)
        const index = this.reportList.findIndex(item => item.id === id)
        if (index > -1) {
          this.reportList[index] = result
        }
        return result
      } catch (error) {
        return null
      }
    },

    // 删除报告
    async deleteReport(id: number) {
      try {
        await http.delete(`/api/report/${id}`)
        const index = this.reportList.findIndex(item => item.id === id)
        if (index > -1) {
          this.reportList.splice(index, 1)
        }
        return true
      } catch (error) {
        return false
      }
    },

    // 批量删除报告
    async batchDeleteReport(ids: number[]) {
      try {
        await http.delete('/api/report/batch', { data: { ids } })
        this.reportList = this.reportList.filter(item => !ids.includes(item.id))
        return true
      } catch (error) {
        return false
      }
    },

    // 下载报告
    async downloadReport(id: number) {
      try {
        const data = await http.get(`/api/report/${id}/download`, {
          responseType: 'blob'
        })
        return data
      } catch (error) {
        return null
      }
    },

    // 生成 SQL 报告
    async generateSqlReport(tableIds: number[]) {
      try {
        const result = await http.post<Report>('/api/report/sql', { tableIds })
        this.reportList.push(result)
        return result
      } catch (error) {
        return null
      }
    },

    // 生成字段报告
    async generateFieldReport(tableId: number) {
      try {
        const result = await http.post<Report>('/api/report/field', { tableId })
        this.reportList.push(result)
        return result
      } catch (error) {
        return null
      }
    }
  }
})
