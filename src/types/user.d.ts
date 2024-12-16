export interface LoginForm {
  username: string
  password: string
  remember?: boolean
}

export interface UserInfo {
  id: number
  username: string
  nickname?: string
  avatar?: string
  email?: string
  role: 'admin' | 'user'
  permissions: string[]
  createTime: string
  updateTime: string
}

export interface LoginResult {
  token: string
  user: UserInfo
}

export interface UpdatePasswordForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateUserForm {
  nickname?: string
  email?: string
  avatar?: string
}
