import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'
import type { Settings, BasicSettings, GenerateSettings, ExportSettings } from '@/types/settings'

const SETTINGS_KEY = 'app_settings'

// 默认设置
const defaultSettings: Settings = {
  basic: {
    systemName: 'SQL生成器',
    dbType: 'mysql',
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci'
  },
  generate: {
    sqlStyle: 'uppercase',
    indentStyle: 'space',
    indentSize: 2,
    maxLineLength: 120
  },
  export: {
    defaultFormat: 'sql',
    fileEncoding: 'utf8',
    options: ['includeComments']
  }
}

export const useSettingsStore = defineStore('settings', {
  state: (): Settings => ({
    ...defaultSettings
  }),

  getters: {
    // 获取基本设置
    getBasicSettings: (state): BasicSettings => state.basic,
    
    // 获取生成设置
    getGenerateSettings: (state): GenerateSettings => state.generate,
    
    // 获取导出设置
    getExportSettings: (state): ExportSettings => state.export
  },

  actions: {
    // 初始化设置
    initSettings() {
      const savedSettings = storage.get(SETTINGS_KEY)
      if (savedSettings) {
        this.$patch(savedSettings)
      }
    },

    // 更新基本设置
    updateBasicSettings(settings: Partial<BasicSettings>) {
      this.basic = { ...this.basic, ...settings }
      this.saveSettings()
    },

    // 更新生成设置
    updateGenerateSettings(settings: Partial<GenerateSettings>) {
      this.generate = { ...this.generate, ...settings }
      this.saveSettings()
    },

    // 更新导出设置
    updateExportSettings(settings: Partial<ExportSettings>) {
      this.export = { ...this.export, ...settings }
      this.saveSettings()
    },

    // 重置所有设置
    resetSettings() {
      this.$patch(defaultSettings)
      this.saveSettings()
    },

    // 保存设置到本地存储
    saveSettings() {
      storage.set(SETTINGS_KEY, {
        basic: this.basic,
        generate: this.generate,
        export: this.export
      })
    }
  }
}) 