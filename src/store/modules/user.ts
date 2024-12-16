import { defineStore } from 'pinia'
import { http } from '@/utils/request'
import { getToken, setToken, removeToken, getUserInfo, setUserInfo, removeUserInfo } from '@/utils/auth'
import type { LoginForm, UserInfo, LoginResult, UpdatePasswordForm, UpdateUserForm } from '@/types/user'

interface UserState {
  token: string | null
  userInfo: UserInfo | null
  permissions: string[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: getToken() || null,
    userInfo: getUserInfo(),
    permissions: []
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && !!state.userInfo,
    isAdmin: (state) => state.userInfo?.role === 'admin',
    hasPermission: (state) => (permission: string) => state.permissions.includes(permission),
    userRole: (state) => state.userInfo?.role || 'user'
  },

  actions: {
    // 登录
    async login(loginForm: LoginForm) {
      try {
        const { token, user } = await http.post<LoginResult>('/api/auth/login', loginForm)
        
        this.token = token
        this.userInfo = user
        this.permissions = user.permissions
        
        setToken(token)
        setUserInfo(user)

        // 记住登录状态
        if (loginForm.remember) {
          localStorage.setItem('remember_username', loginForm.username)
        } else {
          localStorage.removeItem('remember_username')
        }
        
        return true
      } catch (error) {
        return false
      }
    },

    // 注册
    async register(data: { username: string; password: string; email: string }) {
      return await http.post('/api/auth/register', data)
    },

    // 获取用户信息
    async getUserInfo() {
      try {
        const userInfo = await http.get<UserInfo>('/api/user/info')
        this.userInfo = userInfo
        this.permissions = userInfo.permissions
        setUserInfo(userInfo)
        return userInfo
      } catch (error) {
        return null
      }
    },

    // 更新用户信息
    async updateUserInfo(data: UpdateUserForm) {
      try {
        const userInfo = await http.put<UserInfo>('/api/user/info', data)
        this.userInfo = userInfo
        setUserInfo(userInfo)
        return true
      } catch (error) {
        return false
      }
    },

    // 修改密码
    async changePassword(data: UpdatePasswordForm) {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error('两次输入的密码不一致')
      }
      return await http.put('/api/user/password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      })
    },

    // 退出登录
    async logout() {
      try {
        await http.post('/api/auth/logout')
      } catch (error) {
        console.error('Logout failed:', error)
      } finally {
        this.token = null
        this.userInfo = null
        this.permissions = []
        removeToken()
        removeUserInfo()
      }
    },

    // 检查权限
    checkPermission(permission: string | string[]): boolean {
      if (this.isAdmin) return true
      if (!this.permissions) return false
      
      if (Array.isArray(permission)) {
        return permission.some(p => this.permissions.includes(p))
      }
      return this.permissions.includes(permission)
    },

    // 获取记住的用户名
    getRememberedUsername(): string {
      return localStorage.getItem('remember_username') || ''
    }
  }
})
