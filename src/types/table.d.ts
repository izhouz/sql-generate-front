export interface Field {
  id: number
  name: string
  type: string
  length: number | null
  precision?: number
  scale?: number
  nullable: boolean
  defaultValue?: string
  comment?: string
  primaryKey: boolean
  autoIncrement: boolean
  foreignKey?: {
    tableId: number
    fieldId: number
  }
}

export interface Table {
  id?: number
  name: string
  comment?: string
  engine: 'InnoDB' | 'MyISAM'
  charset: 'utf8mb4' | 'utf8' | 'latin1'
  collate?: string
  fields: Field[]
  indexes?: {
    name: string
    fields: string[]
    type: 'UNIQUE' | 'INDEX' | 'FULLTEXT'
  }[]
  createTime?: string
  updateTime?: string
}

export interface TableFormData {
  name: string
  comment: string
  engine: 'InnoDB' | 'MyISAM'
  charset: 'utf8mb4' | 'utf8' | 'latin1'
  fields: Field[]
} 