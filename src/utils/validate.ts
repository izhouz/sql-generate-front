// 邮箱验证
export const isEmail = (value: string): boolean => {
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return reg.test(value)
}

// 手机号验证
export const isPhone = (value: string): boolean => {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(value)
}

// 密码强度验证（至少8位，包含大小写字母和数字）
export const isStrongPassword = (value: string): boolean => {
  const reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
  return reg.test(value)
}

// URL 验证
export const isUrl = (value: string): boolean => {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

// SQL 注入检测
export const hasSqlInjection = (value: string): boolean => {
  const reg = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|WHERE)\b)|(['"\\])/i
  return reg.test(value)
}

// 字段名称验证（字母开头，可包含字母、数字和下划线）
export const isValidFieldName = (value: string): boolean => {
  const reg = /^[a-zA-Z][a-zA-Z0-9_]*$/
  return reg.test(value)
}

// 数据库表名验证
export const isValidTableName = (value: string): boolean => {
  const reg = /^[a-zA-Z][a-zA-Z0-9_]*$/
  return reg.test(value)
}

// 数字范围验证
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

// 字符串长度验证
export const isLengthValid = (value: string, min: number, max: number): boolean => {
  return value.length >= min && value.length <= max
}

// 必填验证
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

// 自定义正则验证
export const matchRegexp = (value: string, regexp: RegExp): boolean => {
  return regexp.test(value)
}
