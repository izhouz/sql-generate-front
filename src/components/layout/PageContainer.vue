<template>
  <div class="page-container">
    <div class="page-header" v-if="title || $slots.header">
      <slot name="header">
        <div class="title-section">
          <h2 class="title">{{ title }}</h2>
          <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
        </div>
        <div class="action-section">
          <slot name="actions" />
        </div>
      </slot>
    </div>
    
    <div class="page-content">
      <slot />
    </div>
    
    <div class="page-footer" v-if="$slots.footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  title?: string
  subtitle?: string
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.page-container {
  padding: 24px;
  min-height: calc(100vh - var(--header-height));
  background-color: var(--el-bg-color-page);
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    
    .title-section {
      .title {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
      
      .subtitle {
        margin: 8px 0 0;
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }
    
    .action-section {
      display: flex;
      gap: 12px;
    }
  }
  
  .page-content {
    background-color: var(--el-bg-color);
    border-radius: 4px;
    box-shadow: var(--el-box-shadow-light);
  }
  
  .page-footer {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--el-border-color-light);
  }
}
</style> 