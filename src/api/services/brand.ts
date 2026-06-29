import axiosInstance from '@/helpers/https'
import type { IGetBrandResponse } from '../models/brand'

export class BrandService {
  public static readonly getAllBrands: () => Promise<IGetBrandResponse[]> = async () =>
    axiosInstance.get<IGetBrandResponse[]>('/brands').then((res) => res.data)

  public static readonly getBrandsByCategory: (categoryId: number) => Promise<IGetBrandResponse[]> =
    async (categoryId) =>
      axiosInstance
        .get<IGetBrandResponse[]>(`/brands/category/${categoryId}`)
        .then((res) => res.data)

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
