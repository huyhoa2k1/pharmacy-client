export type TFilterOp = 'EQ' | 'IN' | 'BETWEEN' | 'GTE' | 'LTE' | 'LIKE'

export interface IPagerFilter {
  key: string
  op?: TFilterOp
  value: unknown
}

export interface IPagerSort {
  field: string
  direction: 'ASC' | 'DESC'
}

export interface IPagerRequest {
  pageNo?: number
  pageSize?: number
  sort?: IPagerSort[]
  searchKeys?: string[]
  searchValue?: string
  filters?: IPagerFilter[]
}
