import { defineStore } from 'pinia'
import { http } from '@/utils/request'

interface FieldInfo {
  id: number
  name: string
  type: string
  length: number
  precision?: number
  scale?: number
  nullable: boolean
  defaultValue?: string
  comment?: string
  autoIncrement: boolean
  primaryKey: boolean
  foreignKey?: {
    tableId: number
    fieldId: number
  }
  createTime: string
  updateTime: string
}

interface FieldState {
  fieldList: FieldInfo[]
  currentField: FieldInfo | null
  loading: boolean
}

export const useFieldInfoStore = defineStore('fieldInfo', {
  state: (): FieldState => ({
    fieldList: [],
    currentField: null,
    loading: false
  }),

  getters: {
    getPrimaryKeys: (state) => {
      return state.fieldList.filter(field => field.primaryKey)
    },
    getForeignKeys: (state) => {
      return state.fieldList.filter(field => field.foreignKey)
    }
  },

  actions: {
    // 获取字段列表
    async getFieldList(params?: { tableId?: number }) {
      this.loading = true
      try {
        const data = await http.get<FieldInfo[]>('/api/field/list', { params })
        this.fieldList = data
        return data
      } catch (error) {
        return []
      } finally {
        this.loading = false
      }
    },

    // 获取字段详情
    async getFieldDetail(id: number) {
      try {
        const data = await http.get<FieldInfo>(`/api/field/${id}`)
        this.currentField = data
        return data
      } catch (error) {
        return null
      }
    },

    // 创建字段
    async createField(data: Omit<FieldInfo, 'id' | 'createTime' | 'updateTime'>) {
      try {
        const result = await http.post<FieldInfo>('/api/field', data)
        this.fieldList.push(result)
        return result
      } catch (error) {
        return null
      }
    },

    // 批量创建字段
    async batchCreateField(fields: Omit<FieldInfo, 'id' | 'createTime' | 'updateTime'>[]) {
      try {
        const result = await http.post<FieldInfo[]>('/api/field/batch', { fields })
        this.fieldList.push(...result)
        return result
      } catch (error) {
        return null
      }
    },

    // 更新字段
    async updateField(id: number, data: Partial<FieldInfo>) {
      try {
        const result = await http.put<FieldInfo>(`/api/field/${id}`, data)
        const index = this.fieldList.findIndex(item => item.id === id)
        if (index > -1) {
          this.fieldList[index] = result
        }
        return result
      } catch (error) {
        return null
      }
    },

    // 删除字段
    async deleteField(id: number) {
      try {
        await http.delete(`/api/field/${id}`)
        const index = this.fieldList.findIndex(item => item.id === id)
        if (index > -1) {
          this.fieldList.splice(index, 1)
        }
        return true
      } catch (error) {
        return false
      }
    },

    // 批量删除字段
    async batchDeleteField(ids: number[]) {
      try {
        await http.delete('/api/field/batch', { data: { ids } })
        this.fieldList = this.fieldList.filter(item => !ids.includes(item.id))
        return true
      } catch (error) {
        return false
      }
    },

    // 导入字段
    async importFields(file: File) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const result = await http.post<FieldInfo[]>('/api/field/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.fieldList.push(...result)
        return result
      } catch (error) {
        return null
      }
    },

    // 导出字段
    async exportFields(tableId?: number) {
      try {
        const params = tableId ? { tableId } : undefined
        const data = await http.get('/api/field/export', {
          params,
          responseType: 'blob'
        })
        return data
      } catch (error) {
        return null
      }
    }
  }
})
