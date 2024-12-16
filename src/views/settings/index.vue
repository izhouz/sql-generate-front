<template>
  <page-container title="系统设置" subtitle="配置系统参数和个性化选项">
    <el-card>
      <el-tabs>
        <!-- 基本设置 -->
        <el-tab-pane label="基本设置">
          <el-form :model="basicSettings" label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="basicSettings.systemName" />
            </el-form-item>
            
            <el-form-item label="数据库类型">
              <el-select v-model="basicSettings.dbType">
                <el-option label="MySQL" value="mysql" />
                <el-option label="PostgreSQL" value="postgresql" />
                <el-option label="SQLite" value="sqlite" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="默认字符集">
              <el-select v-model="basicSettings.charset">
                <el-option label="UTF-8" value="utf8" />
                <el-option label="UTF-8MB4" value="utf8mb4" />
                <el-option label="GBK" value="gbk" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="默认排序规则">
              <el-select v-model="basicSettings.collation">
                <el-option label="utf8_general_ci" value="utf8_general_ci" />
                <el-option label="utf8mb4_general_ci" value="utf8mb4_general_ci" />
                <el-option label="utf8_unicode_ci" value="utf8_unicode_ci" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 生成设置 -->
        <el-tab-pane label="生成设置">
          <el-form :model="generateSettings" label-width="120px">
            <el-form-item label="SQL风格">
              <el-radio-group v-model="generateSettings.sqlStyle">
                <el-radio label="uppercase">大写关键字</el-radio>
                <el-radio label="lowercase">小写关键字</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="缩进风格">
              <el-radio-group v-model="generateSettings.indentStyle">
                <el-radio label="space">空格</el-radio>
                <el-radio label="tab">Tab</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="缩进数量">
              <el-input-number v-model="generateSettings.indentSize" :min="1" :max="8" />
            </el-form-item>
            
            <el-form-item label="每行最大长度">
              <el-input-number v-model="generateSettings.maxLineLength" :min="60" :max="200" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 导出设置 -->
        <el-tab-pane label="导出设置">
          <el-form :model="exportSettings" label-width="120px">
            <el-form-item label="默认导出格式">
              <el-select v-model="exportSettings.defaultFormat">
                <el-option label="SQL文件" value="sql" />
                <el-option label="Excel" value="excel" />
                <el-option label="JSON" value="json" />
                <el-option label="Markdown" value="markdown" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="文件编码">
              <el-select v-model="exportSettings.fileEncoding">
                <el-option label="UTF-8" value="utf8" />
                <el-option label="GBK" value="gbk" />
                <el-option label="ASCII" value="ascii" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="导出选项">
              <el-checkbox-group v-model="exportSettings.options">
                <el-checkbox label="includeDropTable">包含DROP TABLE语句</el-checkbox>
                <el-checkbox label="includeComments">包含注释</el-checkbox>
                <el-checkbox label="includeCreateTime">包含创建时间</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" @click="handleSave">保存设置</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </el-card>
  </page-container>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '@/components/layout/PageContainer.vue'
import { useSettingsStore } from '@/store/modules/settings'
import type { BasicSettings, GenerateSettings, ExportSettings } from '@/types/settings'

const settingsStore = useSettingsStore()

// 基本设置
const basicSettings = reactive<BasicSettings>({
  ...settingsStore.getBasicSettings
})

// 生成设置
const generateSettings = reactive<GenerateSettings>({
  ...settingsStore.getGenerateSettings
})

// 导出设置
const exportSettings = reactive<ExportSettings>({
  ...settingsStore.getExportSettings
})

// 初始化
onMounted(() => {
  settingsStore.initSettings()
})

// 保存设置
const handleSave = async () => {
  try {
    settingsStore.updateBasicSettings(basicSettings)
    settingsStore.updateGenerateSettings(generateSettings)
    settingsStore.updateExportSettings(exportSettings)
    ElMessage.success('设置保存成功')
  } catch (error) {
    console.error('Save settings failed:', error)
    ElMessage.error('设置保存失败')
  }
}

// 重置设置
const handleReset = async () => {
  try {
    await ElMessageBox.confirm('确定要重置所有设置吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    settingsStore.resetSettings()
    Object.assign(basicSettings, settingsStore.getBasicSettings)
    Object.assign(generateSettings, settingsStore.getGenerateSettings)
    Object.assign(exportSettings, settingsStore.getExportSettings)
    ElMessage.success('设置已重置')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Reset settings failed:', error)
      ElMessage.error('设置重置失败')
    }
  }
}
</script>

<style lang="scss" scoped>
.action-buttons {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--el-border-color-light);
  text-align: center;
}
</style> 