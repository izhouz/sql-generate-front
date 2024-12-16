export interface BasicSettings {
  systemName: string
  dbType: 'mysql' | 'postgresql' | 'sqlite'
  charset: 'utf8' | 'utf8mb4' | 'gbk'
  collation: string
}

export interface GenerateSettings {
  sqlStyle: 'uppercase' | 'lowercase'
  indentStyle: 'space' | 'tab'
  indentSize: number
  maxLineLength: number
}

export interface ExportSettings {
  defaultFormat: 'sql' | 'excel' | 'json' | 'markdown'
  fileEncoding: 'utf8' | 'gbk' | 'ascii'
  options: string[]
}

export interface Settings {
  basic: BasicSettings
  generate: GenerateSettings
  export: ExportSettings
} 