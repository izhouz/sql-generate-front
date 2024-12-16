<template>
  <div class="page-container">
    <el-card class="sql-generator">
      <template #header>
        <div class="flex justify-between items-center">
          <h3>SQL 生成器</h3>
          <div>
            <el-button type="primary" @click="handleGenerate">生成 SQL</el-button>
            <el-button @click="handleClear">清空</el-button>
          </div>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        label-position="right"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="8">
            <!-- 操作类型选择 -->
            <el-form-item label="操作类型" prop="operation" required>
              <el-select v-model="formData.operation" placeholder="请选择操作类型">
                <el-option label="SELECT" value="select" />
                <el-option label="INSERT" value="insert" />
                <el-option label="UPDATE" value="update" />
                <el-option label="DELETE" value="delete" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <!-- 表选择 -->
            <el-form-item label="表名" prop="table" required>
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
        </el-row>

        <!-- 字段配置 -->
        <template v-if="formData.table">
          <el-divider>字段配置</el-divider>

          <!-- SELECT 操作 -->
          <template v-if="formData.operation === 'select'">
            <el-form-item label="查询字段">
              <el-checkbox-group v-model="formData.selectedFields">
                <el-space wrap>
                  <el-checkbox
                    v-for="field in fields"
                    :key="field.id"
                    :label="field.name"
                  >
                    {{ field.name }}
                    <el-tooltip
                      v-if="field.comment"
                      :content="field.comment"
                      placement="top"
                    >
                      <el-icon class="info-icon"><InfoFilled /></el-icon>
                    </el-tooltip>
                  </el-checkbox>
                </el-space>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="条件">
              <div
                v-for="(condition, index) in formData.conditions"
                :key="index"
                class="condition-item"
              >
                <el-row :gutter="20">
                  <el-col :span="6">
                    <el-select v-model="condition.field" placeholder="选择字段">
                      <el-option
                        v-for="field in fields"
                        :key="field.id"
                        :label="field.name"
                        :value="field.name"
                      />
                    </el-select>
                  </el-col>
                  <el-col :span="6">
                    <el-select v-model="condition.operator" placeholder="选择操作符">
                      <el-option label="=" value="eq" />
                      <el-option label="!=" value="ne" />
                      <el-option label=">" value="gt" />
                      <el-option label=">=" value="ge" />
                      <el-option label="<" value="lt" />
                      <el-option label="<=" value="le" />
                      <el-option label="LIKE" value="like" />
                      <el-option label="IN" value="in" />
                    </el-select>
                  </el-col>
                  <el-col :span="6">
                    <el-input
                      v-model="condition.value"
                      placeholder="输入值"
                    />
                  </el-col>
                  <el-col :span="4">
                    <el-button
                      type="danger"
                      circle
                      @click="removeCondition(index)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </el-col>
                </el-row>
              </div>
              <div class="mt-2">
                <el-button type="primary" @click="addCondition">添加条件</el-button>
              </div>
            </el-form-item>

            <el-form-item label="排序">
              <div
                v-for="(order, index) in formData.orders"
                :key="index"
                class="order-item"
              >
                <el-row :gutter="20">
                  <el-col :span="6">
                    <el-select v-model="order.field" placeholder="选择字段">
                      <el-option
                        v-for="field in fields"
                        :key="field.id"
                        :label="field.name"
                        :value="field.name"
                      />
                    </el-select>
                  </el-col>
                  <el-col :span="6">
                    <el-select v-model="order.direction" placeholder="排序方向">
                      <el-option label="升序" value="asc" />
                      <el-option label="降序" value="desc" />
                    </el-select>
                  </el-col>
                  <el-col :span="4">
                    <el-button
                      type="danger"
                      circle
                      @click="removeOrder(index)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </el-col>
                </el-row>
              </div>
              <div class="mt-2">
                <el-button type="primary" @click="addOrder">添加排序</el-button>
              </div>
            </el-form-item>
          </template>

          <!-- INSERT 操作 -->
          <template v-else-if="formData.operation === 'insert'">
            <el-form-item
              v-for="field in fields"
              :key="field.id"
              :label="field.name"
              :prop="'values.' + field.name"
            >
              <el-input
                v-model="formData.values[field.name]"
                :placeholder="field.comment || '请输入'"
              />
            </el-form-item>
          </template>

          <!-- UPDATE 操作 -->
          <template v-else-if="formData.operation === 'update'">
            <el-form-item label="更新字段">
              <div
                v-for="field in fields"
                :key="field.id"
                class="update-item"
              >
                <el-row :gutter="20">
                  <el-col :span="4">
                    <el-checkbox v-model="formData.updateFields[field.name]">
                      {{ field.name }}
                    </el-checkbox>
                  </el-col>
                  <el-col :span="8">
                    <el-input
                      v-model="formData.values[field.name]"
                      :disabled="!formData.updateFields[field.name]"
                      :placeholder="field.comment || '请输入'"
                    />
                  </el-col>
                </el-row>
              </div>
            </el-form-item>

            <el-form-item label="条件">
              <div
                v-for="(condition, index) in formData.conditions"
                :key="index"
                class="condition-item"
              >
                <el-row :gutter="20">
                  <el-col :span="6">
                    <el-select v-model="condition.field" placeholder="选择字段">
                      <el-option
                        v-for="field in fields"
                        :key="field.id"
                        :label="field.name"
                        :value="field.name"
                      />
                    </el-select>
                  </el-col>
                  <el-col :span="6">
                    <el-select v-model="condition.operator" placeholder="选择操作符">
                      <el-option label="=" value="eq" />
                      <el-option label="!=" value="ne" />
                      <el-option label=">" value="gt" />
                      <el-option label=">=" value="ge" />
                      <el-option label="<" value="lt" />
                      <el-option label="<=" value="le" />
                      <el-option label="LIKE" value="like" />
                      <el-option label="IN" value="in" />
                    </el-select>
                  </el-col>
                  <el-col :span="6">
                    <el-input
                      v-model="condition.value"
                      placeholder="输入值"
                    />
                  </el-col>
                  <el-col :span="4">
                    <el-button
                      type="danger"
                      circle
                      @click="removeCondition(index)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </el-col>
                </el-row>
              </div>
              <div class="mt-2">
                <el-button type="primary" @click="addCondition">添加条件</el-button>
              </div>
            </el-form-item>
          </template>

          <!-- DELETE 操作 -->
          <template v-else-if="formData.operation === 'delete'">
            <el-form-item label="条件">
              <div
                v-for="(condition, index) in formData.conditions"
                :key="index"
                class="condition-item"
              >
                <el-row :gutter="20">
                  <el-col :span="6">
                    <el-select v-model="condition.field" placeholder="选择字段">
                      <el-option
                        v-for="field in fields"
                        :key="field.id"
                        :label="field.name"
                        :value="field.name"
                      />
                    </el-select>
                  </el-col>
                  <el-col :span="6">
                    <el-select v-model="condition.operator" placeholder="选择操作符">
                      <el-option label="=" value="eq" />
                      <el-option label="!=" value="ne" />
                      <el-option label=">" value="gt" />
                      <el-option label=">=" value="ge" />
                      <el-option label="<" value="lt" />
                      <el-option label="<=" value="le" />
                      <el-option label="LIKE" value="like" />
                      <el-option label="IN" value="in" />
                    </el-select>
                  </el-col>
                  <el-col :span="6">
                    <el-input
                      v-model="condition.value"
                      placeholder="输入值"
                    />
                  </el-col>
                  <el-col :span="4">
                    <el-button
                      type="danger"
                      circle
                      @click="removeCondition(index)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </el-col>
                </el-row>
              </div>
              <div class="mt-2">
                <el-button type="primary" @click="addCondition">添加条件</el-button>
              </div>
            </el-form-item>
          </template>
        </template>
      </el-form>

      <!-- SQL 预览 -->
      <el-divider>SQL 预览</el-divider>
      <div class="sql-preview">
        <codemirror
          v-model="previewSql"
          :extensions="extensions"
          :style="{ height: '200px' }"
          readonly
        />
        <div class="mt-2 text-right">
          <el-button type="primary" @click="handleCopy">复制 SQL</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, InfoFilled } from '@element-plus/icons-vue'
import { Codemirror } from 'vue-codemirror'
import { sql } from '@codemirror/lang-sql'
import { oneDark } from '@codemirror/theme-one-dark'
import { useTableInfoStore } from '@/store/modules/tableInfo'
import type { FormInstance } from 'element-plus'
import type { Table, Field } from '@/types/table'

// 状态
const formRef = ref<FormInstance>()
const previewSql = ref('')
const tableStore = useTableInfoStore()

// CodeMirror 配置
const extensions = [sql(), oneDark]

// 表和字段数据
const tables = ref<Table[]>([])
const fields = ref<Field[]>([])

// 表单数据
const formData = reactive({
  operation: 'select',
  table: '',
  selectedFields: [] as string[],
  conditions: [] as Array<{
    field: string
    operator: string
    value: string
  }>,
  orders: [] as Array<{
    field: string
    direction: 'asc' | 'desc'
  }>,
  values: {} as Record<string, any>,
  updateFields: {} as Record<string, boolean>
})

// 监听操作类型变化
watch(() => formData.operation, () => {
  formData.conditions = []
  formData.orders = []
  formData.values = {}
  formData.updateFields = {}
  formData.selectedFields = []
  generateSql()
})

// 监听表变化
watch(() => formData.table, () => {
  formData.conditions = []
  formData.orders = []
  formData.values = {}
  formData.updateFields = {}
  formData.selectedFields = []
  generateSql()
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
    }
  } catch (error) {
    console.error('Get table detail failed:', error)
  }
}

// 添加条件
const addCondition = () => {
  formData.conditions.push({
    field: '',
    operator: 'eq',
    value: ''
  })
}

// 删除条件
const removeCondition = (index: number) => {
  formData.conditions.splice(index, 1)
  generateSql()
}

// 添加排序
const addOrder = () => {
  formData.orders.push({
    field: '',
    direction: 'asc'
  })
}

// 删除排序
const removeOrder = (index: number) => {
  formData.orders.splice(index, 1)
  generateSql()
}

// 生成 SQL
const generateSql = () => {
  let sql = ''
  const tableName = tables.value.find(t => t.id === formData.table)?.name

  if (!tableName) return

  switch (formData.operation) {
    case 'select':
      sql = generateSelectSql(tableName)
      break
    case 'insert':
      sql = generateInsertSql(tableName)
      break
    case 'update':
      sql = generateUpdateSql(tableName)
      break
    case 'delete':
      sql = generateDeleteSql(tableName)
      break
  }

  previewSql.value = sql
}

// 生成 SELECT SQL
const generateSelectSql = (tableName: string): string => {
  const selectedFields = formData.selectedFields.length > 0
    ? formData.selectedFields.join(', ')
    : '*'
  
  let sql = `SELECT ${selectedFields}\nFROM ${tableName}`

  if (formData.conditions.length > 0) {
    sql += '\nWHERE ' + formData.conditions
      .filter(c => c.field && c.operator && c.value)
      .map(c => `${c.field} ${getOperator(c.operator)} ${formatValue(c.value)}`)
      .join('\nAND ')
  }

  if (formData.orders.length > 0) {
    sql += '\nORDER BY ' + formData.orders
      .filter(o => o.field)
      .map(o => `${o.field} ${o.direction.toUpperCase()}`)
      .join(', ')
  }

  return sql
}

// 生成 INSERT SQL
const generateInsertSql = (tableName: string): string => {
  const values = formData.values
  const fields = Object.keys(values).filter(k => values[k] !== '')
  
  if (fields.length === 0) return ''

  return `INSERT INTO ${tableName} (${fields.join(', ')})\nVALUES (${
    fields.map(f => formatValue(values[f])).join(', ')
  })`
}

// 生成 UPDATE SQL
const generateUpdateSql = (tableName: string): string => {
  const updates = Object.entries(formData.values)
    .filter(([key]) => formData.updateFields[key])
    .map(([key, value]) => `${key} = ${formatValue(value)}`)

  if (updates.length === 0) return ''

  let sql = `UPDATE ${tableName}\nSET ${updates.join(',\n    ')}`

  if (formData.conditions.length > 0) {
    sql += '\nWHERE ' + formData.conditions
      .filter(c => c.field && c.operator && c.value)
      .map(c => `${c.field} ${getOperator(c.operator)} ${formatValue(c.value)}`)
      .join('\nAND ')
  }

  return sql
}

// 生成 DELETE SQL
const generateDeleteSql = (tableName: string): string => {
  let sql = `DELETE FROM ${tableName}`

  if (formData.conditions.length > 0) {
    sql += '\nWHERE ' + formData.conditions
      .filter(c => c.field && c.operator && c.value)
      .map(c => `${c.field} ${getOperator(c.operator)} ${formatValue(c.value)}`)
      .join('\nAND ')
  }

  return sql
}

// 获取操作符
const getOperator = (op: string): string => {
  const operators: Record<string, string> = {
    eq: '=',
    ne: '!=',
    gt: '>',
    ge: '>=',
    lt: '<',
    le: '<=',
    like: 'LIKE',
    in: 'IN'
  }
  return operators[op] || '='
}

// 格式化值
const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number') return value.toString()
  if (Array.isArray(value)) return `(${value.map(v => formatValue(v)).join(', ')})`
  return `'${value.toString().replace(/'/g, "''")}'`
}

// 处理生成
const handleGenerate = () => {
  generateSql()
}

// 处理清空
const handleClear = () => {
  formData.operation = 'select'
  formData.table = ''
  formData.selectedFields = []
  formData.conditions = []
  formData.orders = []
  formData.values = {}
  formData.updateFields = {}
  previewSql.value = ''
}

// 复制 SQL
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(previewSql.value)
    ElMessage.success('复制成功')
  } catch (error) {
    console.error('Copy failed:', error)
  }
}

// 初始化
init()
</script>

<style lang="scss" scoped>
.sql-generator {
  .condition-item,
  .order-item,
  .update-item {
    margin-bottom: 10px;
  }

  .info-icon {
    margin-left: 4px;
    color: var(--el-text-color-secondary);
  }

  .sql-preview {
    background-color: var(--el-bg-color);
    border-radius: 4px;
    padding: 20px;
  }
}
</style> 