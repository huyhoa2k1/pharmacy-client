import axiosInstance from '@/helpers/https'
import type {
  IGeoPlace,
  IShippingQuote,
  IShippingQuoteRequest,
  IStore,
  IStoreInventory,
  IStoreRequest,
} from '../models/store'

export class StoreService {
  public static readonly getStores: (params?: {
    provinceCode?: string
    includeInactive?: boolean
  }) => Promise<IStore[]> = async (params) =>
    axiosInstance.get<IStore[]>('/stores', { params }).then((res) => res.data)

  public static readonly createStore: (payload: IStoreRequest) => Promise<IStore> = async (
    payload,
  ) => axiosInstance.post<IStore>('/stores', payload).then((res) => res.data)

  public static readonly updateStore: (id: number, payload: IStoreRequest) => Promise<IStore> =
    async (id, payload) =>
      axiosInstance.put<IStore>(`/stores/${id}`, payload).then((res) => res.data)

  public static readonly getInventory: (storeId: number) => Promise<IStoreInventory[]> = async (
    storeId,
  ) => axiosInstance.get<IStoreInventory[]>(`/stores/${storeId}/inventory`).then((res) => res.data)

  public static readonly setInventory: (
    storeId: number,
    productId: number,
    amount: number,
  ) => Promise<IStoreInventory> = async (storeId, productId, amount) =>
    axiosInstance
      .put<IStoreInventory>(`/stores/${storeId}/inventory`, { productId, amount })
      .then((res) => res.data)
}

export class GeoService {
  public static readonly search: (q: string) => Promise<IGeoPlace[]> = async (q) =>
    axiosInstance.get<IGeoPlace[]>('/geo/search', { params: { q } }).then((res) => res.data)

  public static readonly reverse: (lat: number, lng: number) => Promise<IGeoPlace | null> = async (
    lat,
    lng,
  ) =>
    axiosInstance
      .get<IGeoPlace>('/geo/reverse', { params: { lat, lng } })
      .then((res) => res.data)
      .catch(() => null)
}

export class ShippingService {
  public static readonly quote: (payload: IShippingQuoteRequest) => Promise<IShippingQuote> =
    async (payload) =>
      axiosInstance.post<IShippingQuote>('/shipping/quote', payload).then((res) => res.data)
}
