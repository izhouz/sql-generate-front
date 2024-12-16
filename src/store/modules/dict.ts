import { defineStore } from 'pinia'
import { http } from '@/utils/request'

interface DictItem {
  id: number
  name: string
  code: string
  value: string
  type: string
  sort: number
  enabled: boolean
  remark?: string
  createTime: string
  updateTime: string
}

interface DictState {
  dictList: DictItem[]
  currentDict: DictItem | null
  loading: boolean
}

export const useDictStore = defineStore('dict', {
  state: (): DictState => ({
    dictList: [],
    currentDict: null,
    loading: false
  }),

  getters: {
    getDictByType: (state) => (type: string) => {
      return state.dictList.filter(item => item.type === type)
    },
    getDictByCode: (state) => (code: string) => {
      return state.dictList.find(item => item.code === code)
    }
  },

  actions: {
    // 获取字典列表
    async getDictList(params?: { type?: string; enabled?: boolean }) {
      this.loading = true
      try {
        const data = await http.get<DictItem[]>('/api/dict/list', { params })
        this.dictList = data
        return data
      } catch (error) {
        return []
      } finally {
        this.loading = false
      }
    },

    // 获取字典详情
    async getDictDetail(id: number) {
      try {
        const data = await http.get<DictItem>(`/api/dict/${id}`)
        this.currentDict = data
        return data
      } catch (error) {
        return null
      }
    },

    // 创建字典
    async createDict(data: Omit<DictItem, 'id' | 'createTime' | 'updateTime'>) {
      try {
        const result = await http.post<DictItem>('/api/dict', data)
        this.dictList.push(result)
        return result
      } catch (error) {
        return null
      }
    },

    // 更新字典
    async updateDict(id: number, data: Partial<DictItem>) {
      try {
        const result = await http.put<DictItem>(`/api/dict/${id}`, data)
        const index = this.dictList.findIndex(item => item.id === id)
        if (index > -1) {
          this.dictList[index] = result
        }
        return result
      } catch (error) {
        return null
      }
    },

    // 删除字典
    async deleteDict(id: number) {
      try {
        await http.delete(`/api/dict/${id}`)
        const index = this.dictList.findIndex(item => item.id === id)
        if (index > -1) {
          this.dictList.splice(index, 1)
        }
        return true
      } catch (error) {
        return false
      }
    },

    // 批量删除字典
    async batchDeleteDict(ids: number[]) {
      try {
        await http.delete('/api/dict/batch', { data: { ids } })
        this.dictList = this.dictList.filter(item => !ids.includes(item.id))
        return true
      } catch (error) {
        return false
      }
    },

    // 导出字典
    async exportDict(type?: string) {
      try {
        const params = type ? { type } : undefined
        const data = await http.get('/api/dict/export', { 
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
