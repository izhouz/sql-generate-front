import { defineStore } from 'pinia'
import { http } from '@/utils/request'
import { getToken, setToken, removeToken, getUserInfo, setUserInfo, removeUserInfo, type UserInfo } from '@/utils/auth'

interface UserState {
  token: string | null
  userInfo: UserInfo | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: getToken() || null,
    userInfo: getUserInfo()
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && !!state.userInfo,
    isAdmin: (state) => state.userInfo?.role === 'admin'
  },

  actions: {
    // 登录
    async login(username: string, password: string) {
      try {
        const { token, user } = await http.post<{ token: string; user: UserInfo }>('/api/auth/login', {
          username,
          password
        })
        
        this.token = token
        this.userInfo = user
        
        setToken(token)
        setUserInfo(user)
        
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
        setUserInfo(userInfo)
        return userInfo
      } catch (error) {
        return null
      }
    },

    // 更新用户信息
    async updateUserInfo(data: Partial<UserInfo>) {
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
    async changePassword(oldPassword: string, newPassword: string) {
      return await http.put('/api/user/password', {
        oldPassword,
        newPassword
      })
    },

    // 退出登录
    logout() {
      this.token = null
      this.userInfo = null
      removeToken()
      removeUserInfo()
    }
  }
})
