<template>
  <div class="page-container">
    <el-card class="table-designer">
      <template #header>
        <div class="flex justify-between items-center">
          <h3>表设计器</h3>
          <div>
            <el-button type="primary" @click="handleSave">保存</el-button>
            <el-button @click="handlePreview">预览 SQL</el-button>
            <el-button @click="handleImport">导入</el-button>
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
        <!-- 基本信息 -->
        <el-card class="mb-4">
          <template #header>
            <h4>基本信息</h4>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="表名" prop="name" required>
                <el-input v-model="formData.name" placeholder="请输入表名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="表注释" prop="comment">
                <el-input v-model="formData.comment" placeholder="请输入表注释" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="存储引擎" prop="engine">
                <el-select v-model="formData.engine" placeholder="请选择存储引擎">
                  <el-option label="InnoDB" value="InnoDB" />
                  <el-option label="MyISAM" value="MyISAM" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="字符集" prop="charset">
                <el-select v-model="formData.charset" placeholder="请选择字符集">
                  <el-option label="utf8mb4" value="utf8mb4" />
                  <el-option label="utf8" value="utf8" />
                  <el-option label="latin1" value="latin1" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 字段列表 -->
        <el-card>
          <template #header>
            <div class="flex justify-between items-center">
              <h4>字段列表</h4>
              <el-button type="primary" @click="addField">添加字段</el-button>
            </div>
          </template>

          <draggable
            v-model="formData.fields"
            item-key="id"
            handle=".drag-handle"
            ghost-class="ghost"
            @start="drag = true"
            @end="drag = false"
          >
            <template #item="{ element, index }">
              <div class="field-item">
                <el-icon class="drag-handle"><DragIcon /></el-icon>
                
                <el-row :gutter="20">
                  <el-col :span="4">
                    <el-form-item
                      :prop="'fields.' + index + '.name'"
                      :rules="{ required: true, message: '请输入字段名' }"
                    >
                      <el-input v-model="element.name" placeholder="字段名" />
                    </el-form-item>
                  </el-col>
                  
                  <el-col :span="4">
                    <el-form-item
                      :prop="'fields.' + index + '.type'"
                      :rules="{ required: true, message: '请选择数据类型' }"
                    >
                      <el-select v-model="element.type" placeholder="���据类型">
                        <el-option label="INT" value="int" />
                        <el-option label="BIGINT" value="bigint" />
                        <el-option label="VARCHAR" value="varchar" />
                        <el-option label="TEXT" value="text" />
                        <el-option label="DATETIME" value="datetime" />
                        <el-option label="DECIMAL" value="decimal" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  
                  <el-col :span="3">
                    <el-form-item :prop="'fields.' + index + '.length'">
                      <el-input-number
                        v-model="element.length"
                        placeholder="长度"
                        :min="1"
                        :disabled="!['varchar', 'int', 'bigint'].includes(element.type)"
                      />
                    </el-form-item>
                  </el-col>
                  
                  <el-col :span="3">
                    <el-form-item :prop="'fields.' + index + '.defaultValue'">
                      <el-input
                        v-model="element.defaultValue"
                        placeholder="默认值"
                      />
                    </el-form-item>
                  </el-col>
                  
                  <el-col :span="4">
                    <el-form-item :prop="'fields.' + index + '.comment'">
                      <el-input
                        v-model="element.comment"
                        placeholder="注释"
                      />
                    </el-form-item>
                  </el-col>
                  
                  <el-col :span="4">
                    <el-space>
                      <el-checkbox v-model="element.nullable">允许空</el-checkbox>
                      <el-checkbox v-model="element.primaryKey">主键</el-checkbox>
                      <el-checkbox v-model="element.autoIncrement">自增</el-checkbox>
                    </el-space>
                  </el-col>
                  
                  <el-col :span="2">
                    <el-button
                      type="danger"
                      circle
                      @click="removeField(index)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </el-col>
                </el-row>
              </div>
            </template>
          </draggable>
        </el-card>
      </el-form>
    </el-card>

    <!-- SQL 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="SQL 预览"
      width="60%"
    >
      <codemirror
        v-model="previewSql"
        :extensions="extensions"
        :style="{ height: '400px' }"
      />
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleCopy">复制</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, DragIcon } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import { Codemirror } from 'vue-codemirror'
import { sql } from '@codemirror/lang-sql'
import { oneDark } from '@codemirror/theme-one-dark'
import { useTableInfoStore } from '@/store/modules/tableInfo'
import type { FormInstance } from 'element-plus'

// 状态
const formRef = ref<FormInstance>()
const drag = ref(false)
const previewVisible = ref(false)
const previewSql = ref('')
const tableStore = useTableInfoStore()

// CodeMirror 配置
const extensions = [sql(), oneDark]

// 表单数据
const formData = reactive({
  name: '',
  comment: '',
  engine: 'InnoDB',
  charset: 'utf8mb4',
  fields: []
})

// 添加字段
const addField = () => {
  formData.fields.push({
    id: Date.now(),
    name: '',
    type: '',
    length: null,
    nullable: true,
    defaultValue: '',
    comment: '',
    primaryKey: false,
    autoIncrement: false
  })
}

// 删除字段
const removeField = (index: number) => {
  formData.fields.splice(index, 1)
}

// 保存表
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    const result = await tableStore.createTable(formData)
    if (result) {
      ElMessage.success('保存成功')
    }
  } catch (error) {
    console.error('Save failed:', error)
  }
}

// 预览 SQL
const handlePreview = async () => {
  try {
    const sql = await tableStore.generateSql(formData)
    previewSql.value = sql
    previewVisible.value = true
  } catch (error) {
    console.error('Preview failed:', error)
  }
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

// 导入表结构
const handleImport = () => {
  // TODO: 实现导入功能
}

// 导出表结构
const handleExport = async () => {
  try {
    await tableStore.exportTable(formData.id)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Export failed:', error)
  }
}
</script>

<style lang="scss" scoped>
.table-designer {
  .field-item {
    position: relative;
    padding: 20px;
    border: 1px solid var(--border-color-light);
    border-radius: 4px;
    margin-bottom: 10px;
    background-color: #fff;

    &:hover {
      border-color: var(--primary-color);
    }
  }

  .drag-handle {
    position: absolute;
    left: -20px;
    top: 50%;
    transform: translateY(-50%);
    cursor: move;
    color: var(--text-color-secondary);
  }
}

.ghost {
  opacity: 0.5;
  background: var(--background-color-light);
}

:deep(.el-form-item) {
  margin-bottom: 0;
}
</style> 