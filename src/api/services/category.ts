import axiosInstance from '@/helpers/https'
import type { IGetCategoryResponse } from '../models/category'

export class CategoryService {
  public static readonly getAllCategories: () => Promise<IGetCategoryResponse[]> = async () =>
    axiosInstance.get<IGetCategoryResponse[]>('/categories').then((res) => res.data)

  public static readonly getCategoryById: (id: number) => Promise<IGetCategoryResponse> = async (
    id,
  ) => axiosInstance.get<IGetCategoryResponse>(`/categories/${id}`).then((res) => res.data)

  public static readonly createCategory: (
    name: string,
    slug: string,
  ) => Promise<IGetCategoryResponse> = async (name, slug) =>
    axiosInstance.post<IGetCategoryResponse>('/categories', { name, slug }).then((res) => res.data)

  public static readonly updateCategory: (
    id: number,
    name: string,
    slug: string,
  ) => Promise<IGetCategoryResponse> = async (id, name, slug) =>
    axiosInstance
      .patch<IGetCategoryResponse>(`/categories/${id}`, { name, slug })
      .then((res) => res.data)

  public static readonly deleteCategory: (id: number) => Promise<void> = async (id) =>
    axiosInstance.delete<void>(`/categories/${id}`).then((res) => res.data)
}
