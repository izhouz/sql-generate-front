import { defineStore } from 'pinia'
import { http } from '@/utils/request'
import type { FieldInfo } from './fieldInfo'

interface TableInfo {
  id: number
  name: string
  comment?: string
  engine: string
  charset: string
  collate: string
  fields: FieldInfo[]
  indexes?: {
    name: string
    fields: string[]
    type: 'UNIQUE' | 'INDEX' | 'FULLTEXT'
  }[]
  createTime: string
  updateTime: string
}

interface TableState {
  tableList: TableInfo[]
  currentTable: TableInfo | null
  loading: boolean
  generatedSql: string
}

export const useTableInfoStore = defineStore('tableInfo', {
  state: (): TableState => ({
    tableList: [],
    currentTable: null,
    loading: false,
    generatedSql: ''
  }),

  getters: {
    getTableByName: (state) => (name: string) => {
      return state.tableList.find(table => table.name === name)
    }
  },

  actions: {
    // 获取表列表
    async getTableList() {
      this.loading = true
      try {
        const data = await http.get<TableInfo[]>('/api/table/list')
        this.tableList = data
        return data
      } catch (error) {
        return []
      } finally {
        this.loading = false
      }
    },

    // 获取表详情
    async getTableDetail(id: number) {
      try {
        const data = await http.get<TableInfo>(`/api/table/${id}`)
        this.currentTable = data
        return data
      } catch (error) {
        return null
      }
    },

    // 创建表
    async createTable(data: Omit<TableInfo, 'id' | 'createTime' | 'updateTime'>) {
      try {
        const result = await http.post<TableInfo>('/api/table', data)
        this.tableList.push(result)
        return result
      } catch (error) {
        return null
      }
    },

    // 更新表
    async updateTable(id: number, data: Partial<TableInfo>) {
      try {
        const result = await http.put<TableInfo>(`/api/table/${id}`, data)
        const index = this.tableList.findIndex(item => item.id === id)
        if (index > -1) {
          this.tableList[index] = result
        }
        return result
      } catch (error) {
        return null
      }
    },

    // 删除表
    async deleteTable(id: number) {
      try {
        await http.delete(`/api/table/${id}`)
        const index = this.tableList.findIndex(item => item.id === id)
        if (index > -1) {
          this.tableList.splice(index, 1)
        }
        return true
      } catch (error) {
        return false
      }
    },

    // 生成建表 SQL
    async generateSql(tableId: number) {
      try {
        const { sql } = await http.get<{ sql: string }>(`/api/table/${tableId}/sql`)
        this.generatedSql = sql
        return sql
      } catch (error) {
        return ''
      }
    },

    // 从 SQL 导入表结构
    async importFromSql(sql: string) {
      try {
        const result = await http.post<TableInfo>('/api/table/import/sql', { sql })
        this.tableList.push(result)
        return result
      } catch (error) {
        return null
      }
    },

    // 从 JSON 导入表结构
    async importFromJson(file: File) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const result = await http.post<TableInfo>('/api/table/import/json', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.tableList.push(result)
        return result
      } catch (error) {
        return null
      }
    },

    // 导出表结构
    async exportTable(id: number, format: 'sql' | 'json' = 'sql') {
      try {
        const data = await http.get(`/api/table/${id}/export`, {
          params: { format },
          responseType: 'blob'
        })
        return data
      } catch (error) {
        return null
      }
    }
  }
})
