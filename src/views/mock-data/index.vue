<template>
  <div class="page-container">
    <el-card class="mock-data">
      <template #header>
        <div class="flex justify-between items-center">
          <h3>模拟数据生成器</h3>
          <div>
            <el-button type="primary" :loading="generating" @click="handleGenerate">
              {{ generating ? '生成中...' : '生成数据' }}
            </el-button>
            <el-button @click="handleClear">清空</el-button>
            <el-button :disabled="!previewData" @click="handleExport">导出</el-button>
            <el-dropdown v-if="formData.table" @command="handleBatchCommand">
              <el-button type="primary" link>
                批量操作
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="setString">设为字符串类型</el-dropdown-item>
                  <el-dropdown-item command="setNumber">设为数字类型</el-dropdown-item>
                  <el-dropdown-item command="setNull">允许为空</el-dropdown-item>
                  <el-dropdown-item command="setNotNull">不允许为空</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        label-position="right"
        label-width="100px"
      >
        <!-- 基本配置 -->
        <el-card class="mb-4">
          <template #header>
            <div class="flex justify-between items-center">
              <h4>基本配置</h4>
              <el-button v-if="formData.table" type="primary" link @click="handleSaveTemplate">
                保存为模板
              </el-button>
            </div>
          </template>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="选择表" prop="table" required>
                <el-select
                  v-model="formData.table"
                  placeholder="请选择表"
                  @change="handleTableChange"
                >
                  <el-option
                    v-for="table in tables"
                    :key="table.id"
                    :label="table.name"
                    :value="table.id"
                  >
                    <span>{{ table.name }}</span>
                    <span class="text-secondary">({{ table.comment }})</span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="生成数量" prop="count" required>
                <el-input-number
                  v-model="formData.count"
                  :min="1"
                  :max="1000"
                  :step="10"
                  step-strictly
                  placeholder="请输入生成数量"
                />
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="输出格式" prop="format" required>
                <el-select v-model="formData.format" placeholder="请选择输出格式">
                  <el-option label="SQL" value="sql">
                    <span>SQL</span>
                    <span class="text-secondary">(INSERT 语句)</span>
                  </el-option>
                  <el-option label="JSON" value="json">
                    <span>JSON</span>
                    <span class="text-secondary">(数组格式)</span>
                  </el-option>
                  <el-option label="CSV" value="csv">
                    <span>CSV</span>
                    <span class="text-secondary">(逗号分隔)</span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 字段配置 -->
        <el-card v-if="formData.table">
          <template #header>
            <div class="flex justify-between items-center">
              <h4>字段配置</h4>
              <div>
                <el-button type="primary" link @click="handleSaveTemplate">
                  保存为模板
                </el-button>
                <el-button type="danger" link @click="handleDeleteTemplate">
                  删除模板
                </el-button>
              </div>
            </div>
          </template>

          <div class="field-filters mb-4">
            <el-input
              v-model="fieldSearchText"
              placeholder="搜索字段"
              clearable
              prefix-icon="Search"
              class="field-search"
            />
            <el-radio-group v-model="fieldTypeFilter" size="small">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button label="string">字符串</el-radio-button>
              <el-radio-button label="number">数字</el-radio-button>
              <el-radio-button label="datetime">日期</el-radio-button>
            </el-radio-group>
          </div>

          <div
            v-for="field in filteredFields"
            :key="field.id"
            class="field-config"
          >
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item :label="field.name">
                  <el-select
                    v-model="formData.fieldConfigs[field.name].type"
                    placeholder="请选择生成类型"
                  >
                    <el-option-group label="基础类型">
                      <el-option label="自增ID" value="autoIncrement" />
                      <el-option label="随机数字" value="number" />
                      <el-option label="随机字符串" value="string" />
                      <el-option label="布尔值" value="boolean" />
                      <el-option label="日期时间" value="datetime" />
                    </el-option-group>
                    <el-option-group label="名称">
                      <el-option label="姓名" value="name" />
                      <el-option label="姓氏" value="lastName" />
                      <el-option label="名字" value="firstName" />
                      <el-option label="用名" value="username" />
                    </el-option-group>
                    <el-option-group label="联系方式">
                      <el-option label="邮箱" value="email" />
                      <el-option label="手机号" value="phone" />
                      <el-option label="地址" value="address" />
                    </el-option-group>
                    <el-option-group label="公司">
                      <el-option label="公司名" value="company" />
                      <el-option label="职位" value="jobTitle" />
                      <el-option label="部门" value="department" />
                    </el-option-group>
                    <el-option-group label="互联网">
                      <el-option label="域名" value="domain" />
                      <el-option label="URL" value="url" />
                      <el-option label="IP地址" value="ip" />
                    </el-option-group>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="配置">
                  <!-- 数字类型配置 -->
                  <template v-if="formData.fieldConfigs[field.name].type === 'number'">
                    <el-row :gutter="10">
                      <el-col :span="8">
                        <el-input-number
                          v-model="formData.fieldConfigs[field.name].min"
                          placeholder="最小值"
                        />
                      </el-col>
                      <el-col :span="8">
                        <el-input-number
                          v-model="formData.fieldConfigs[field.name].max"
                          placeholder="最大值"
                        />
                      </el-col>
                      <el-col :span="8">
                        <el-input-number
                          v-model="formData.fieldConfigs[field.name].precision"
                          placeholder="精度"
                          :min="0"
                          :max="10"
                        />
                      </el-col>
                    </el-row>
                  </template>

                  <!-- 字符串类型配置 -->
                  <template v-else-if="formData.fieldConfigs[field.name].type === 'string'">
                    <el-row :gutter="10">
                      <el-col :span="6">
                        <el-input-number
                          v-model="formData.fieldConfigs[field.name].length"
                          placeholder="长度"
                          :min="1"
                        />
                      </el-col>
                      <el-col :span="6">
                        <el-select
                          v-model="formData.fieldConfigs[field.name].casing"
                          placeholder="大小写"
                        >
                          <el-option label="保持原样" value="none" />
                          <el-option label="小写" value="lower" />
                          <el-option label="大写" value="upper" />
                        </el-select>
                      </el-col>
                      <el-col :span="6">
                        <el-input
                          v-model="formData.fieldConfigs[field.name].prefix"
                          placeholder="前缀"
                        />
                      </el-col>
                      <el-col :span="6">
                        <el-input
                          v-model="formData.fieldConfigs[field.name].suffix"
                          placeholder="后缀"
                        />
                      </el-col>
                    </el-row>
                  </template>

                  <!-- 日期时间类型配置 -->
                  <template v-else-if="formData.fieldConfigs[field.name].type === 'datetime'">
                    <el-row :gutter="10">
                      <el-col :span="8">
                        <el-date-picker
                          v-model="formData.fieldConfigs[field.name].from"
                          type="datetime"
                          placeholder="开始日期"
                        />
                      </el-col>
                      <el-col :span="8">
                        <el-date-picker
                          v-model="formData.fieldConfigs[field.name].to"
                          type="datetime"
                          placeholder="结束日期"
                        />
                      </el-col>
                      <el-col :span="8">
                        <el-select
                          v-model="formData.fieldConfigs[field.name].format"
                          placeholder="日期格式"
                        >
                          <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
                          <el-option label="YYYY-MM-DD HH:mm:ss" value="YYYY-MM-DD HH:mm:ss" />
                          <el-option label="YYYY/MM/DD" value="YYYY/MM/DD" />
                          <el-option label="MM-DD" value="MM-DD" />
                        </el-select>
                      </el-col>
                    </el-row>
                  </template>

                  <!-- 手机号类型配置 -->
                  <template v-else-if="formData.fieldConfigs[field.name].type === 'phone'">
                    <el-row :gutter="10">
                      <el-col :span="12">
                        <el-select
                          v-model="formData.fieldConfigs[field.name].format"
                          placeholder="号码格式"
                        >
                          <el-option label="手机号 (1xx)" value="1##########" />
                          <el-option label="座机 (0xx)" value="0##-########" />
                          <el-option label="400电话" value="400-###-####" />
                        </el-select>
                      </el-col>
                    </el-row>
                  </template>

                  <!-- 地址类型配置 -->
                  <template v-else-if="formData.fieldConfigs[field.name].type === 'address'">
                    <el-row :gutter="10">
                      <el-col :span="12">
                        <el-select
                          v-model="formData.fieldConfigs[field.name].format"
                          placeholder="地址格式"
                        >
                          <el-option label="完整地址" value="full" />
                          <el-option label="简短地址" value="short" />
                        </el-select>
                      </el-col>
                    </el-row>
                  </template>
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item label="预览">
                  <div class="preview-value">
                    {{ getPreviewValue(field.name) }}
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-form>

      <!-- 预览 -->
      <template v-if="previewData">
        <el-divider>预览</el-divider>
        <div class="preview">
          <codemirror
            v-model="previewData"
            :extensions="extensions"
            :style="{ height: '300px' }"
            readonly
          />
          <div class="mt-2 text-right">
            <el-button type="primary" @click="handleCopy">复制</el-button>
          </div>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, Search } from '@element-plus/icons-vue'
import { Codemirror } from 'vue-codemirror'
import { sql } from '@codemirror/lang-sql'
import { oneDark } from '@codemirror/theme-one-dark'
import { faker } from '@faker-js/faker/locale/zh_CN'
import { useTableInfoStore } from '@/store/modules/tableInfo'
import type { FormInstance } from 'element-plus'
import type { Table, Field } from '@/types/table'

// 类型定义
interface FieldConfig {
  type: string
  min?: number
  max?: number
  precision?: number
  length?: number
  casing?: 'none' | 'lower' | 'upper'
  from?: Date
  to?: Date
  nullable?: boolean
  format?: string
  prefix?: string
  suffix?: string
}

interface FormData {
  table: string | number
  count: number
  format: 'sql' | 'json' | 'csv'
  fieldConfigs: Record<string, FieldConfig>
}

// 状态
const formRef = ref<FormInstance>()
const previewData = ref('')
const generating = ref(false)
const fieldSearchText = ref('')
const fieldTypeFilter = ref('')
const tableStore = useTableInfoStore()

// CodeMirror 配置
const extensions = computed(() => {
  return formData.format === 'sql' ? [sql(), oneDark] : [oneDark]
})

// 表和字段数据
const tables = ref<Table[]>([])
const fields = ref<Field[]>([])

// 表单数据
const formData = reactive<FormData>({
  table: '',
  count: 10,
  format: 'sql',
  fieldConfigs: {}
})

// 过滤后的字段列表
const filteredFields = computed(() => {
  return fields.value.filter(field => {
    const matchesSearch = !fieldSearchText.value || 
      field.name.toLowerCase().includes(fieldSearchText.value.toLowerCase()) ||
      field.comment?.toLowerCase().includes(fieldSearchText.value.toLowerCase())
    
    const matchesType = !fieldTypeFilter.value ||
      formData.fieldConfigs[field.name]?.type === fieldTypeFilter.value
    
    return matchesSearch && matchesType
  })
})

// 初始化
const init = async () => {
  try {
    const data = await tableStore.getTableList()
    tables.value = data
  } catch (error) {
    console.error('Init failed:', error)
    ElMessage.error('获取表列表失败')
  }
}

// 获取默认生成器类型
const getDefaultGeneratorType = (field: Field): string => {
  if (field.autoIncrement) return 'autoIncrement'
  
  const type = field.type.toLowerCase()
  if (type.includes('int') || type.includes('decimal') || type.includes('float')) return 'number'
  if (type.includes('char') || type.includes('text')) return 'string'
  if (type.includes('date') || type.includes('time')) return 'datetime'
  if (type.includes('bool')) return 'boolean'
  return 'string'
}

// 处理表变化
const handleTableChange = async (tableId: number) => {
  try {
    const table = await tableStore.getTableDetail(tableId)
    if (table) {
      fields.value = table.fields
      // 尝试加载存的模板
      loadTemplate(tableId)
      // 如果没有模板，使用默认配置
      if (Object.keys(formData.fieldConfigs).length === 0) {
        table.fields.forEach((field: Field) => {
          formData.fieldConfigs[field.name] = {
            type: getDefaultGeneratorType(field),
            min: 0,
            max: 100,
            precision: 0,
            length: 10,
            casing: 'none',
            from: new Date(2020, 0, 1),
            to: new Date()
          }
        })
      }
    }
  } catch (error) {
    console.error('Get table detail failed:', error)
    ElMessage.error('获取表详情失败')
  }
}

// 格式化日期
const formatDate = (date: Date, format: string): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 生成单个值
const generateValue = (fieldName: string): any => {
  const config = formData.fieldConfigs[fieldName]
  if (!config) return null
  if (config.nullable && Math.random() < 0.1) return null // 10% 概率生成空值

  try {
    let value: any = null
    switch (config.type) {
      case 'autoIncrement':
        return null // 由数据库自动生成
      case 'number':
        value = faker.number.float({
          min: config.min ?? 0,
          max: config.max ?? 100,
          precision: config.precision ?? 0
        })
        break
      case 'string':
        value = faker.string.alpha(config.length ?? 10)
        if (config.prefix) value = config.prefix + value
        if (config.suffix) value = value + config.suffix
        switch (config.casing) {
          case 'lower':
            value = value.toLowerCase()
            break
          case 'upper':
            value = value.toUpperCase()
            break
        }
        break
      case 'boolean':
        value = faker.datatype.boolean()
        break
      case 'datetime':
        value = faker.date.between({
          from: config.from ?? new Date(2020, 0, 1),
          to: config.to ?? new Date()
        })
        if (config.format) {
          value = formatDate(value, config.format)
        }
        break
      case 'name':
        value = faker.person.fullName()
        break
      case 'lastName':
        value = faker.person.lastName()
        break
      case 'firstName':
        value = faker.person.firstName()
        break
      case 'username':
        value = faker.internet.userName()
        break
      case 'email':
        value = faker.internet.email()
        break
      case 'phone':
        value = faker.phone.number(config.format ?? '1##########')
        break
      case 'address':
        value = config.format === 'short' 
          ? `${faker.location.city()}${faker.location.street()}`
          : `${faker.location.state()}${faker.location.city()}${faker.location.street()}`
        break
      case 'company':
        value = faker.company.name()
        break
      case 'jobTitle':
        value = faker.person.jobTitle()
        break
      case 'department':
        value = faker.commerce.department()
        break
      case 'domain':
        value = faker.internet.domainName()
        break
      case 'url':
        value = faker.internet.url()
        break
      case 'ip':
        value = faker.internet.ip()
        break
      default:
        return null
    }

    if (config.prefix && typeof value === 'string') {
      value = config.prefix + value
    }
    if (config.suffix && typeof value === 'string') {
      value = value + config.suffix
    }

    return value
  } catch (error) {
    console.error(`Error generating value for ${fieldName}:`, error)
    return null
  }
}

// 获取预览值
const getPreviewValue = (fieldName: string): string => {
  try {
    const value = generateValue(fieldName)
    if (value === null) return 'NULL'
    if (typeof value === 'string') return value
    if (value instanceof Date) return value.toISOString()
    return String(value)
  } catch (error) {
    console.error(`Error getting preview value for ${fieldName}:`, error)
    return 'ERROR'
  }
}

// 生成数据
const generateData = () => {
  try {
    const data = []
    const selectedTable = tables.value.find(t => t.id === formData.table)
    const tableName = selectedTable?.name

    if (!tableName) {
      ElMessage.warning('请选择表')
      return
    }

    if (formData.count <= 0 || formData.count > 1000) {
      ElMessage.warning('生成数量必须在 1-1000 之间')
      return
    }

    for (let i = 0; i < formData.count; i++) {
      const record: Record<string, any> = {}
      fields.value.forEach(field => {
        if (formData.fieldConfigs[field.name]?.type !== 'autoIncrement') {
          record[field.name] = generateValue(field.name)
        }
      })
      data.push(record)
    }

    switch (formData.format) {
      case 'sql':
        previewData.value = generateSqlString(tableName, data)
        break
      case 'json':
        previewData.value = JSON.stringify(data, null, 2)
        break
      case 'csv':
        previewData.value = generateCsvString(data)
        break
    }

    ElMessage.success(`成功生成 ${data.length} 条数据`)
  } catch (error) {
    console.error('Generate data failed:', error)
    ElMessage.error('数据生成失败')
  }
}

// 生成 SQL 字符串
const generateSqlString = (tableName: string, data: Record<string, any>[]): string => {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const insertHeader = `INSERT INTO ${tableName} (${headers.join(', ')})`
  
  return data.map(record => {
    const values = headers.map(h => formatValue(record[h]))
    return `${insertHeader}\nVALUES (${values.join(', ')});`
  }).join('\n\n')
}

// 生成 CSV 字符串
const generateCsvString = (data: Record<string, any>[]): string => {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const rows = [
    headers.join(','),
    ...data.map(record =>
      headers.map(header => {
        const value = record[header]
        if (value === null) return ''
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`
        if (value instanceof Date) return value.toISOString()
        return String(value)
      }).join(',')
    )
  ]

  return rows.join('\n')
}

// 格式化值
const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'boolean') return value ? '1' : '0'
  if (value instanceof Date) return `'${value.toISOString()}'`
  return `'${value.toString().replace(/'/g, "''")}'`
}

// 处理生成
const handleGenerate = async () => {
  if (!formData.table) {
    ElMessage.warning('请选择表')
    return
  }

  if (formData.count <= 0 || formData.count > 1000) {
    ElMessage.warning('生成数量必须在 1-1000 之间')
    return
  }

  generating.value = true
  try {
    await generateData()
  } finally {
    generating.value = false
  }
}

// 处理清空
const handleClear = () => {
  formData.table = ''
  formData.count = 10
  formData.format = 'sql'
  formData.fieldConfigs = {}
  previewData.value = ''
}

// 处理导出
const handleExport = () => {
  if (!previewData.value) {
    ElMessage.warning('请先生成数据')
    return
  }

  try {
    const blob = new Blob([previewData.value], {
      type: formData.format === 'json'
        ? 'application/json'
        : formData.format === 'csv'
          ? 'text/csv'
          : 'text/plain'
    })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `mock_data.${formData.format}`
    link.click()
    URL.revokeObjectURL(link.href)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败')
  }
}

// 复制
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(previewData.value)
    ElMessage.success('复制成功')
  } catch (error) {
    console.error('Copy failed:', error)
    ElMessage.error('复制失败')
  }
}

// 保存为模板
const handleSaveTemplate = () => {
  try {
    const template = {
      table: formData.table,
      fieldConfigs: formData.fieldConfigs
    }
    localStorage.setItem(`mock_template_${formData.table}`, JSON.stringify(template))
    ElMessage.success('模板保存成功')
  } catch (error) {
    console.error('Save template failed:', error)
    ElMessage.error('模板保存失败')
  }
}

// 加载模板
const loadTemplate = (tableId: number) => {
  try {
    const templateStr = localStorage.getItem(`mock_template_${tableId}`)
    if (templateStr) {
      const template = JSON.parse(templateStr)
      formData.fieldConfigs = template.fieldConfigs
      ElMessage.success('已加载保存的模板')
    }
  } catch (error) {
    console.error('Load template failed:', error)
  }
}

// 批量操作处理
const handleBatchCommand = (command: string) => {
  try {
    switch (command) {
      case 'setString':
        fields.value.forEach(field => {
          if (formData.fieldConfigs[field.name]) {
            formData.fieldConfigs[field.name].type = 'string'
          }
        })
        ElMessage.success('已将所有字段设置为字符串类型')
        break
      case 'setNumber':
        fields.value.forEach(field => {
          if (formData.fieldConfigs[field.name]) {
            formData.fieldConfigs[field.name].type = 'number'
          }
        })
        ElMessage.success('已将所有字段设置为数字类型')
        break
      case 'setNull':
        fields.value.forEach(field => {
          if (formData.fieldConfigs[field.name]) {
            formData.fieldConfigs[field.name].nullable = true
          }
        })
        ElMessage.success('已允许所有字段为空')
        break
      case 'setNotNull':
        fields.value.forEach(field => {
          if (formData.fieldConfigs[field.name]) {
            formData.fieldConfigs[field.name].nullable = false
          }
        })
        ElMessage.success('已设置所有字段不允许为空')
        break
    }
  } catch (error) {
    console.error('Batch operation failed:', error)
    ElMessage.error('批量操作失败')
  }
}

// 删除模板
const handleDeleteTemplate = async () => {
  try {
    await ElMessageBox.confirm('确定要删除当前表的模板吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    localStorage.removeItem(`mock_template_${formData.table}`)
    ElMessage.success('模板删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete template failed:', error)
      ElMessage.error('模板删除失败')
    }
  }
}

// 初始化
init()
</script>

<style lang="scss" scoped>
.page-container {
  padding: 20px;
  
  .mock-data {
    .field-filters {
      display: flex;
      align-items: center;
      gap: 16px;

      .field-search {
        width: 200px;
      }
    }

    .field-config {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--el-border-color-light);

      &:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
    }

    .preview-value {
      padding: 8px 12px;
      background-color: var(--el-bg-color-page);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 4px;
      min-height: 36px;
      word-break: break-all;
      font-family: monospace;
    }

    .preview {
      background-color: var(--el-bg-color-page);
      border-radius: 4px;
      padding: 20px;

      :deep(.cm-editor) {
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 4px;
        font-family: monospace;
      }
    }

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .text-secondary {
      color: var(--el-text-color-secondary);
      margin-left: 8px;
    }

    .el-divider {
      margin: 32px 0;
    }
  }
}
</style> 