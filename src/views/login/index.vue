<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>SQL Generator</h2>
          <p>欢迎使用 SQL 生成器系统</p>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleSubmit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
            @keyup.enter="focusPassword"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            ref="passwordRef"
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleSubmit"
          />
        </el-form-item>
        
        <el-form-item>
          <div class="flex justify-between">
            <el-checkbox v-model="formData.remember">记住我</el-checkbox>
            <el-link type="primary" @click="handleForgotPassword">忘记密码？</el-link>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="submit-btn"
            @click="handleSubmit"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>

        <el-divider>
          <span class="text-gray">其他登录方式</span>
        </el-divider>

        <div class="other-login">
          <el-tooltip content="GitHub 登录" placement="top">
            <el-button circle>
              <el-icon><svg-icon icon="github" /></el-icon>
            </el-button>
          </el-tooltip>
          
          <el-tooltip content="微信登录" placement="top">
            <el-button circle>
              <el-icon><svg-icon icon="wechat" /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import type { LoginForm } from '@/types/user'

// 状态
const loading = ref(false)
const formRef = ref<FormInstance>()
const passwordRef = ref<HTMLElement>()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formData = reactive<LoginForm>({
  username: '',
  password: '',
  remember: false
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 初始化
onMounted(() => {
  // 获取记住的用户名
  const rememberedUsername = userStore.getRememberedUsername()
  if (rememberedUsername) {
    formData.username = rememberedUsername
    formData.remember = true
  }
})

// 聚焦密码输入框
const focusPassword = () => {
  passwordRef.value?.focus()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const success = await userStore.login(formData)
    if (success) {
      ElMessage.success('登录成功')
      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    } else {
      ElMessage.error('用户名或密码错误')
    }
  } catch (error) {
    console.error('Login failed:', error)
  } finally {
    loading.value = false
  }
}

// 处理忘记密码
const handleForgotPassword = () => {
  ElMessage.info('请联系管理员重置密码')
}
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1f4037 0%, #99f2c8 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  
  .card-header {
    text-align: center;
    color: var(--el-text-color-primary);
    
    h2 {
      margin-bottom: 10px;
      font-size: 24px;
    }
    
    p {
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
  }
  
  :deep(.el-form-item__label) {
    font-weight: 500;
  }
  
  .submit-btn {
    width: 100%;
    padding: 12px 0;
  }

  .other-login {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 16px;
  }

  .text-gray {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}
</style> 