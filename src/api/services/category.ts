import axiosInstance from '@/helpers/https'
import type { IGetCategoryResponse } from '../models/category'
import type { IPageResponse } from '../models/product'
import type { IPagerRequest } from '../models/pager'
import { fetchAllPages } from './pager'

export interface ICategoryQueryRequest {
  pager?: IPagerRequest
}

export class CategoryService {
  public static readonly getCategoriesPage: (
    request: ICategoryQueryRequest,
  ) => Promise<IPageResponse<IGetCategoryResponse>> = async (request) =>
    axiosInstance.post('/categories/getAllCategories', request).then((res) => res.data)

  public static readonly getAllCategories: () => Promise<IGetCategoryResponse[]> = async () =>
    fetchAllPages(CategoryService.getCategoriesPage, {})

  public static readonly getCategoryById: (id: number) => Promise<IGetCategoryResponse> = async (
    id,
  ) => axiosInstance.get<IGetCategoryResponse>(`/categories/${id}`).then((res) => res.data)

  public static readonly createCategory: (
    name: string,
    slug: string,
    imageUrl?: string,
  ) => Promise<IGetCategoryResponse> = async (name, slug, imageUrl) =>
    axiosInstance
      .post<IGetCategoryResponse>('/categories', { name, slug, imageUrl })
      .then((res) => res.data)

  // imageUrl: undefined keeps the current image, '' clears it.
  public static readonly updateCategory: (
    id: number,
    name: string,
    slug: string,
    imageUrl?: string,
  ) => Promise<IGetCategoryResponse> = async (id, name, slug, imageUrl) =>
    axiosInstance
      .patch<IGetCategoryResponse>(`/categories/${id}`, { name, slug, imageUrl })
      .then((res) => res.data)

  public static readonly deleteCategory: (id: number) => Promise<void> = async (id) =>
    axiosInstance.delete<void>(`/categories/${id}`).then((res) => res.data)
}
