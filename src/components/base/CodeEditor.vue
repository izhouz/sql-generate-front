<template>
  <div class="code-editor">
    <div class="editor-header" v-if="title || $slots.header">
      <slot name="header">
        <div class="title">{{ title }}</div>
      </slot>
    </div>
    
    <div class="editor-body" :style="{ height }">
      <codemirror
        v-model="innerValue"
        :extensions="extensions"
        :placeholder="placeholder"
        :readonly="readonly"
        :autofocus="autofocus"
        @change="handleChange"
      />
    </div>
    
    <div class="editor-footer" v-if="$slots.footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { sql } from '@codemirror/lang-sql'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'

interface Props {
  modelValue?: string
  title?: string
  mode?: 'sql' | 'json' | 'text'
  height?: string
  placeholder?: string
  readonly?: boolean
  autofocus?: boolean
  theme?: 'light' | 'dark'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  title: '',
  mode: 'text',
  height: '200px',
  placeholder: '',
  readonly: false,
  autofocus: false,
  theme: 'dark'
})

const emit = defineEmits(['update:modelValue', 'change'])

// 内部值
const innerValue = ref(props.modelValue)

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== innerValue.value) {
    innerValue.value = newValue
  }
})

// 监听内部值变化
watch(innerValue, (newValue) => {
  emit('update:modelValue', newValue)
})

// 编辑器扩展
const extensions = computed(() => {
  const exts = []

  // 语言模式
  switch (props.mode) {
    case 'sql':
      exts.push(sql())
      break
    case 'json':
      exts.push(json())
      break
  }

  // 主题
  if (props.theme === 'dark') {
    exts.push(oneDark)
  }

  // 只读模式
  if (props.readonly) {
    exts.push(EditorView.editable.of(false))
  }

  return exts
})

// 处理内容变化
const handleChange = (value: string) => {
  emit('change', value)
}
</script>

<style lang="scss" scoped>
.code-editor {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
  
  .editor-header {
    padding: 8px 12px;
    background-color: var(--el-bg-color-page);
    border-bottom: 1px solid var(--el-border-color);
    
    .title {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }
  
  .editor-body {
    :deep(.cm-editor) {
      height: 100%;
      
      .cm-scroller {
        font-family: monospace;
      }
    }
  }
  
  .editor-footer {
    padding: 8px 12px;
    background-color: var(--el-bg-color-page);
    border-top: 1px solid var(--el-border-color);
  }
}
</style> 