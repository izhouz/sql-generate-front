interface Storage {
  get(key: string): any
  set(key: string, value: any): void
  remove(key: string): void
  clear(): void
}

// localStorage 封装
class LocalStorage implements Storage {
  get(key: string): any {
    const value = localStorage.getItem(key)
    try {
      return value ? JSON.parse(value) : null
    } catch {
      return value
    }
  }

  set(key: string, value: any): void {
    const data = typeof value === 'object' ? JSON.stringify(value) : value
    localStorage.setItem(key, data)
  }

  remove(key: string): void {
    localStorage.removeItem(key)
  }

  clear(): void {
    localStorage.clear()
  }
}

// sessionStorage 封装
class SessionStorage implements Storage {
  get(key: string): any {
    const value = sessionStorage.getItem(key)
    try {
      return value ? JSON.parse(value) : null
    } catch {
      return value
    }
  }

  set(key: string, value: any): void {
    const data = typeof value === 'object' ? JSON.stringify(value) : value
    sessionStorage.setItem(key, data)
  }

  remove(key: string): void {
    sessionStorage.removeItem(key)
  }

  clear(): void {
    sessionStorage.clear()
  }
}

// 默认使用 localStorage
export const storage = new LocalStorage()

// 导出 sessionStorage 实例，按需使用
export const sessionStorage = new SessionStorage()

// 导出类型定义
export type { Storage }
