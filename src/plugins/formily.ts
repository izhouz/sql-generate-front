import { App } from 'vue'
import { createForm } from '@formily/core'
import { createSchemaField } from '@formily/vue'
import {
  FormItem,
  Input,
  Select,
  Switch,
  NumberPicker,
  ArrayTable,
  Space,
  FormLayout,
  FormGrid
} from '@formily/element-plus'

// 创建表单组件
const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
    Switch,
    NumberPicker,
    ArrayTable,
    Space,
    FormLayout,
    FormGrid
  }
})

// 创建默认表单
export const form = createForm()

// 配置 Formily
export function setupFormily(app: App) {
  // 注册全局组件
  app.component('SchemaField', SchemaField)
}

// 导出工具函数
export function createTableForm(defaultValues = {}) {
  return createForm({
    initialValues: defaultValues,
    validateFirst: true
  })
}

// SQL 生成器的表单模式
export const sqlGeneratorSchema = {
  type: 'object',
  properties: {
    operation: {
      type: 'string',
      title: '操作类型',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      enum: [
        { label: 'SELECT', value: 'select' },
        { label: 'INSERT', value: 'insert' },
        { label: 'UPDATE', value: 'update' },
        { label: 'DELETE', value: 'delete' }
      ],
      required: true
    },
    table: {
      type: 'string',
      title: '表名',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      required: true
    },
    fields: {
      type: 'array',
      title: '字段',
      'x-decorator': 'FormItem',
      'x-component': 'ArrayTable',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            title: '字段名',
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            required: true
          },
          operator: {
            type: 'string',
            title: '操作符',
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            enum: [
              { label: '=', value: 'eq' },
              { label: '!=', value: 'ne' },
              { label: '>', value: 'gt' },
              { label: '>=', value: 'ge' },
              { label: '<', value: 'lt' },
              { label: '<=', value: 'le' },
              { label: 'LIKE', value: 'like' },
              { label: 'IN', value: 'in' }
            ]
          },
          value: {
            type: 'string',
            title: '值',
            'x-decorator': 'FormItem',
            'x-component': 'Input'
          }
        }
      }
    }
  }
}

// 表设计器的表单模式
export const tableDesignerSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '表名',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      required: true
    },
    comment: {
      type: 'string',
      title: '表注释',
      'x-decorator': 'FormItem',
      'x-component': 'Input'
    },
    engine: {
      type: 'string',
      title: '存储引擎',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      enum: [
        { label: 'InnoDB', value: 'InnoDB' },
        { label: 'MyISAM', value: 'MyISAM' }
      ],
      default: 'InnoDB'
    },
    charset: {
      type: 'string',
      title: '字符集',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      enum: [
        { label: 'utf8mb4', value: 'utf8mb4' },
        { label: 'utf8', value: 'utf8' },
        { label: 'latin1', value: 'latin1' }
      ],
      default: 'utf8mb4'
    },
    fields: {
      type: 'array',
      title: '字段列表',
      'x-decorator': 'FormItem',
      'x-component': 'ArrayTable',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            title: '字段名',
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            required: true
          },
          type: {
            type: 'string',
            title: '数据类型',
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            enum: [
              { label: 'INT', value: 'int' },
              { label: 'BIGINT', value: 'bigint' },
              { label: 'VARCHAR', value: 'varchar' },
              { label: 'TEXT', value: 'text' },
              { label: 'DATETIME', value: 'datetime' },
              { label: 'DECIMAL', value: 'decimal' }
            ],
            required: true
          },
          length: {
            type: 'number',
            title: '长度',
            'x-decorator': 'FormItem',
            'x-component': 'NumberPicker'
          },
          nullable: {
            type: 'boolean',
            title: '允许空',
            'x-decorator': 'FormItem',
            'x-component': 'Switch',
            default: true
          },
          defaultValue: {
            type: 'string',
            title: '默认值',
            'x-decorator': 'FormItem',
            'x-component': 'Input'
          },
          comment: {
            type: 'string',
            title: '注释',
            'x-decorator': 'FormItem',
            'x-component': 'Input'
          }
        }
      }
    }
  }
} 