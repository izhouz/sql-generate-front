import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/store/modules/user'

export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (value && !userStore.checkPermission(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}

// 使用示例：
// <el-button v-permission="'user:create'">创建用户</el-button>
// <el-button v-permission="['user:edit', 'user:delete']">编辑/删除用户</el-button> 