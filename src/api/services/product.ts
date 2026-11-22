import axiosInstance from '@/helpers/https'
import type {
  IGetProductResponse,
  IPageResponse,
  ICreateProductRequest,
  ISetProductSaleRequest,
} from '../models/product'
import type { IPagerFilter, IPagerRequest } from '../models/pager'
import { fetchAllPages } from './pager'

export interface IProductQueryRequest {
  categoryId?: number
  onSale?: boolean
  minSold?: number
  pager?: IPagerRequest
}

export class ProductService {
  public static readonly getProductsPage: (
    request: IProductQueryRequest,
  ) => Promise<IPageResponse<IGetProductResponse>> = async (request) =>
    axiosInstance
      .post<IPageResponse<IGetProductResponse>>('/products/getAllProducts', request)
      .then((res) => res.data)

  public static readonly getAllProducts: () => Promise<IGetProductResponse[]> = async () =>
    fetchAllPages(ProductService.getProductsPage, {})

  public static readonly getProductsOnSale: () => Promise<IGetProductResponse[]> = async () =>
    fetchAllPages(ProductService.getProductsPage, { onSale: true })

  public static readonly getProductsByCategory: (
    categoryId: number,
    params?: Record<string, unknown>,
  ) => Promise<IPageResponse<IGetProductResponse>> = async (categoryId, params = {}) => {
    const filters: IPagerFilter[] = []
    const brandIds = params.brandIds as number[] | undefined
    if (brandIds?.length) filters.push({ key: 'brandId', op: 'IN', value: brandIds })
    const minPrice = params.minPrice as number | undefined
    const maxPrice = params.maxPrice as number | undefined
    if (minPrice != null || maxPrice != null) {
      filters.push({
        key: 'price',
        op: 'BETWEEN',
        value: [minPrice ?? 0, maxPrice ?? 1_000_000_000],
      })
    }
    return ProductService.getProductsPage({
      categoryId,
      pager: {
        pageNo: (params.page as number | undefined) ?? 0,
        pageSize: (params.size as number | undefined) ?? 12,
        sort: [
          {
            field: 'price',
            direction: String(params.sortDirection).toLowerCase() === 'desc' ? 'DESC' : 'ASC',
          },
        ],
        filters,
      },
    })
  }

  public static readonly getProductById: (id: number) => Promise<IGetProductResponse> = async (
    id,
  ) => axiosInstance.get<IGetProductResponse>(`/products/${id}`).then((res) => res.data)

  public static readonly searchProducts: (keyword: string) => Promise<IGetProductResponse[]> =
    async (keyword) =>
      axiosInstance
        .get<IGetProductResponse[]>(`/products/search?keyword=${keyword}`)
        .then((res) => res.data)

  public static readonly getBestSellingProducts: (
    minSold?: number,
  ) => Promise<IGetProductResponse[]> = async (minSold = 5) =>
    fetchAllPages(ProductService.getProductsPage, {
      minSold,
      pager: { sort: [{ field: 'sold', direction: 'DESC' }] },
    })

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

  public static readonly setSaleProducts: (payload: ISetProductSaleRequest) => Promise<boolean> =
    async (payload) => axiosInstance.put<boolean>('/products/sale', payload).then((res) => res.data)
}
