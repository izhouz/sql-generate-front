import { storage } from './storage'

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'user_info'

export interface UserInfo {
  id: number
  username: string
  email: string
  role: string
}

// Token 相关操作
export const getToken = (): string => {
  return storage.get(TOKEN_KEY)
}

export const setToken = (token: string) => {
  storage.set(TOKEN_KEY, token)
}

export const removeToken = () => {
  storage.remove(TOKEN_KEY)
}

// 用户信息相关操作
export const getUserInfo = (): UserInfo | null => {
  return storage.get(USER_INFO_KEY)
}

export const setUserInfo = (userInfo: UserInfo) => {
  storage.set(USER_INFO_KEY, userInfo)
}

export const removeUserInfo = () => {
  storage.remove(USER_INFO_KEY)
}

// 清除所有认证信息
export const clearAuth = () => {
  removeToken()
  removeUserInfo()
}

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return !!getToken() && !!getUserInfo()
}

// 检查是否具有特定权限
export const hasPermission = (permission: string): boolean => {
  const userInfo = getUserInfo()
  if (!userInfo) return false
  
  // 这里可以根据实际的权限系统进行更复杂的判断
  return userInfo.role === 'admin'
}
