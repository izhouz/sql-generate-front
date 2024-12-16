<template>
  <div class="page-container">
    <el-card class="mock-data">
      <template #header>
        <div class="flex justify-between items-center">
          <h3>模拟数据生成器</h3>
          <div>
            <el-button type="primary" @click="handleGenerate">生成数据</el-button>
            <el-button @click="handleClear">清空</el-button>
            <el-button @click="handleExport">导出</el-button>
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
            <h4>基本配置</h4>
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
                  placeholder="请输入生成数量"
                />
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="输出格式" prop="format" required>
                <el-select v-model="formData.format" placeholder="请选择输出格式">
                  <el-option label="SQL" value="sql" />
                  <el-option label="JSON" value="json" />
                  <el-option label="CSV" value="csv" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 字段配置 -->
        <el-card v-if="formData.table">
          <template #header>
            <h4>字段配置</h4>
          </template>

          <div
            v-for="field in fields"
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
                      <el-option label="用���名" value="username" />
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
                      <el-col :span="8">
                        <el-input-number
                          v-model="formData.fieldConfigs[field.name].length"
                          placeholder="长度"
                          :min="1"
                        />
                      </el-col>
                      <el-col :span="8">
                        <el-select
                          v-model="formData.fieldConfigs[field.name].casing"
                          placeholder="大小写"
                        >
                          <el-option label="保持原样" value="none" />
                          <el-option label="小写" value="lower" />
                          <el-option label="大写" value="upper" />
                        </el-select>
                      </el-col>
                    </el-row>
                  </template>

                  <!-- 日期时间类型配置 -->
                  <template v-else-if="formData.fieldConfigs[field.name].type === 'datetime'">
                    <el-row :gutter="10">
                      <el-col :span="11">
                        <el-date-picker
                          v-model="formData.fieldConfigs[field.name].from"
                          type="datetime"
                          placeholder="开始日期"
                        />
                      </el-col>
                      <el-col :span="11">
                        <el-date-picker
                          v-model="formData.fieldConfigs[field.name].to"
                          type="datetime"
                          placeholder="结束日期"
                        />
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
import { ElMessage } from 'element-plus'
import { Codemirror } from 'vue-codemirror'
import { sql } from '@codemirror/lang-sql'
import { oneDark } from '@codemirror/theme-one-dark'
import { faker } from '@faker-js/faker/locale/zh_CN'
import { useTableInfoStore } from '@/store/modules/tableInfo'
import type { FormInstance } from 'element-plus'
import type { Table, Field } from '@/types/table'

// 状态
const formRef = ref<FormInstance>()
const previewData = ref('')
const tableStore = useTableInfoStore()

// CodeMirror 配置
const extensions = computed(() => {
  return formData.format === 'sql' ? [sql(), oneDark] : [oneDark]
})

// 表和字段数据
const tables = ref<Table[]>([])
const fields = ref<Field[]>([])

// 表单数据
const formData = reactive({
  table: '',
  count: 10,
  format: 'sql',
  fieldConfigs: {} as Record<string, {
    type: string
    min?: number
    max?: number
    precision?: number
    length?: number
    casing?: 'none' | 'lower' | 'upper'
    from?: Date
    to?: Date
  }>
})

// 初始化
const init = async () => {
  try {
    const data = await tableStore.getTableList()
    tables.value = data
  } catch (error) {
    console.error('Init failed:', error)
  }
}

// 处理表变化
const handleTableChange = async (tableId: number) => {
  try {
    const table = await tableStore.getTableDetail(tableId)
    if (table) {
      fields.value = table.fields
      // 初始化字段配置
      formData.fieldConfigs = {}
      table.fields.forEach(field => {
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
  } catch (error) {
    console.error('Get table detail failed:', error)
  }
}

// 获取默认生成器类型
const getDefaultGeneratorType = (field: Field): string => {
  if (field.autoIncrement) return 'autoIncrement'
  
  switch (field.type.toLowerCase()) {
    case 'int':
    case 'bigint':
    case 'decimal':
      return 'number'
    case 'varchar':
    case 'text':
      return 'string'
    case 'datetime':
      return 'datetime'
    case 'boolean':
      return 'boolean'
    default:
      return 'string'
  }
}

// 生成单个值
const generateValue = (fieldName: string): any => {
  const config = formData.fieldConfigs[fieldName]
  if (!config) return null

  switch (config.type) {
    case 'autoIncrement':
      return null // 由数据库自动生成
    case 'number':
      return faker.number.float({
        min: config.min,
        max: config.max,
        precision: config.precision
      })
    case 'string':
      let value = faker.string.alpha(config.length)
      switch (config.casing) {
        case 'lower':
          return value.toLowerCase()
        case 'upper':
          return value.toUpperCase()
        default:
          return value
      }
    case 'boolean':
      return faker.datatype.boolean()
    case 'datetime':
      return faker.date.between({
        from: config.from || new Date(2020, 0, 1),
        to: config.to || new Date()
      })
    case 'name':
      return faker.person.fullName()
    case 'lastName':
      return faker.person.lastName()
    case 'firstName':
      return faker.person.firstName()
    case 'username':
      return faker.internet.userName()
    case 'email':
      return faker.internet.email()
    case 'phone':
      return faker.phone.number()
    case 'address':
      return faker.location.streetAddress()
    case 'company':
      return faker.company.name()
    case 'jobTitle':
      return faker.person.jobTitle()
    case 'department':
      return faker.commerce.department()
    case 'domain':
      return faker.internet.domainName()
    case 'url':
      return faker.internet.url()
    case 'ip':
      return faker.internet.ip()
    default:
      return null
  }
}

// 获取预览值
const getPreviewValue = (fieldName: string): string => {
  const value = generateValue(fieldName)
  if (value === null) return 'NULL'
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

// 生成数据
const generateData = () => {
  const data = []
  const tableName = tables.value.find(t => t.id === formData.table)?.name

  if (!tableName) return

  for (let i = 0; i < formData.count; i++) {
    const record: Record<string, any> = {}
    fields.value.forEach(field => {
      if (!formData.fieldConfigs[field.name].type === 'autoIncrement') {
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
}

// 生成 SQL 字符串
const generateSqlString = (tableName: string, data: Record<string, any>[]): string => {
  return data.map(record => {
    const fields = Object.keys(record).filter(k => record[k] !== null)
    const values = fields.map(f => formatValue(record[f]))
    return `INSERT INTO ${tableName} (${fields.join(', ')})\nVALUES (${values.join(', ')});`
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
  if (value === null) return 'NULL'
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'boolean') return value ? '1' : '0'
  if (value instanceof Date) return `'${value.toISOString()}'`
  return `'${value.toString().replace(/'/g, "''")}'`
}

// 处理生成
const handleGenerate = () => {
  if (!formData.table) {
    ElMessage.warning('请选择表')
    return
  }
  generateData()
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
}

// 复制
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(previewData.value)
    ElMessage.success('复制成功')
  } catch (error) {
    console.error('Copy failed:', error)
  }
}

// 初始化
init()
</script>

<style lang="scss" scoped>
.mock-data {
  .field-config {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color-light);

    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
  }

  .preview-value {
    padding: 8px;
    background-color: var(--el-bg-color);
    border-radius: 4px;
    min-height: 36px;
    word-break: break-all;
  }

  .preview {
    background-color: var(--el-bg-color);
    border-radius: 4px;
    padding: 20px;
  }
}
</style> 