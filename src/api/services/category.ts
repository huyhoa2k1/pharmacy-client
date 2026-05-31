import axiosInstance from '@/helpers/https'
import type { IGetCategoryResponse } from '../models/category'

export class CategoryService {
  public static readonly getAllCategories: () => Promise<IGetCategoryResponse[]> = async () =>
    axiosInstance.get<IGetCategoryResponse[]>('/categories').then((res) => res.data)

  public static readonly getCategoryById: (id: number) => Promise<IGetCategoryResponse> = async (
    id,
  ) => axiosInstance.get<IGetCategoryResponse>(`/categories/${id}`).then((res) => res.data)
}
