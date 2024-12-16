import dayjs from 'dayjs'

// 日期格式化
export const formatDate = (date: Date | string | number, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format)
}

// 时间格式化
export const formatDateTime = (date: Date | string | number): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 文件大小格式化
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// 数字千分位格式化
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 金额格式化
export const formatMoney = (amount: number, currency: string = '¥'): string => {
  return `${currency}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

// SQL 语句格式化
export const formatSql = (sql: string): string => {
  // 简单的 SQL 格式化，实际项目中可以使用专业的 SQL 格式化库
  return sql
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*=\s*/g, ' = ')
    .replace(/\s*>\s*/g, ' > ')
    .replace(/\s*<\s*/g, ' < ')
    .replace(/\s*\(\s*/g, ' (')
    .replace(/\s*\)\s*/g, ') ')
    .trim()
}

// 字段名称格式化（驼峰转下划线）
export const formatFieldName = (name: string): string => {
  return name.replace(/([A-Z])/g, '_$1').toLowerCase()
}

// 表名格式化（统一小写，替换特殊字符）
export const formatTableName = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9_]/g, '_')
}

// 字符串截断
export const truncateString = (str: string, length: number): string => {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

// 手机号脱敏
export const maskPhone = (phone: string): string => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 邮箱脱敏
export const maskEmail = (email: string): string => {
  const [name, domain] = email.split('@')
  const maskedName = name.charAt(0) + '***' + name.charAt(name.length - 1)
  return `${maskedName}@${domain}`
}
