import axiosInstance from '@/helpers/https'
import type { IGetBrandResponse } from '../models/brand'
import type { IPageResponse } from '../models/product'
import type { IPagerRequest } from '../models/pager'
import { fetchAllPages } from './pager'

export interface IBrandQueryRequest {
  categoryId?: number
  pager?: IPagerRequest
}

export class BrandService {
  public static readonly getBrandsPage: (
    request: IBrandQueryRequest,
  ) => Promise<IPageResponse<IGetBrandResponse>> = async (request) =>
    axiosInstance.post('/brands/getAllBrands', request).then((res) => res.data)

  public static readonly getAllBrands: () => Promise<IGetBrandResponse[]> = async () =>
    fetchAllPages(BrandService.getBrandsPage, {})

  public static readonly getBrandsByCategory: (categoryId: number) => Promise<IGetBrandResponse[]> =
    async (categoryId) => fetchAllPages(BrandService.getBrandsPage, { categoryId })

  public static readonly createBrand: (
    name: string,
    slug: string,
    categoryId: number,
  ) => Promise<IGetBrandResponse> = async (name, slug, categoryId) =>
    axiosInstance
      .post<IGetBrandResponse>('/brands', { name, slug, categoryId })
      .then((res) => res.data)

  public static readonly deleteBrand: (id: number) => Promise<void> = async (id) =>
    axiosInstance.delete<void>(`/brands/${id}`).then((res) => res.data)
}
