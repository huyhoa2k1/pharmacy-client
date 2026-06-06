import axiosInstance from '@/helpers/https'
import type { IGetProductResponse, IPageResponse, ICreateProductRequest } from '../models/product'

export class ProductService {
  public static readonly getAllProducts: () => Promise<IGetProductResponse[]> = async () =>
    axiosInstance.get<IGetProductResponse[]>('/products').then((res) => res.data)

  public static readonly getProductsByCategory: (
    categoryId: number,
    params?: Record<string, unknown>,
  ) => Promise<IPageResponse<IGetProductResponse>> = async (categoryId, params) =>
    axiosInstance
      .get<IPageResponse<IGetProductResponse>>(`/products/by-category/${categoryId}`, {
        params,
      })
      .then((res) => res.data)

  public static readonly getProductById: (id: number) => Promise<IGetProductResponse> = async (
    id,
  ) => axiosInstance.get<IGetProductResponse>(`/products/${id}`).then((res) => res.data)

  public static readonly searchProducts: (keyword: string) => Promise<IGetProductResponse[]> =
    async (keyword) =>
      axiosInstance
        .get<IGetProductResponse[]>(`/products/search?keyword=${keyword}`)
        .then((res) => res.data)

  public static readonly uploadProductImages: (formData: FormData) => Promise<string[]> = async (
    formData,
  ) =>
    axiosInstance
      .post<string[]>('/products/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data)

  public static readonly createProduct: (
    payload: ICreateProductRequest,
  ) => Promise<IGetProductResponse> = async (payload) =>
    axiosInstance.post<IGetProductResponse>('/products', payload).then((res) => res.data)
}
