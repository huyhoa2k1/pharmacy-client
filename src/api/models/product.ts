import type { IGetBrandResponse } from './brand'

export interface IGetProductResponse {
  id: number
  name: string
  slug: string
  description: string
  imageUrl: string[]
  price: number
  discount: number
  amount: number
  sold: number
  isSale: boolean
  sale?: boolean
  brand: IGetBrandResponse
  createdAt: string
  updatedAt: string
}

export interface ICreateProductRequest {
  slug: string
  name: string
  description: string
  imageUrl: string[]
  price: number
  discount: number
  amount: number
  brandId: number
}

export interface ISetProductSaleRequest {
  productIds: number[]
  isSale: boolean
  discount: number
  saleEndTime: string
}

export interface IPageable {
  pageNumber: number
  pageSize: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  offset: number
  unpaged: boolean
  paged: boolean
}

export interface IPageResponse<T> {
  content: T[]
  pageable: IPageable
  last: boolean
  totalPages: number
  totalElements: number
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  numberOfElements: number
  first: boolean
  empty: boolean
}
