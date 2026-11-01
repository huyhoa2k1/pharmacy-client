export interface IMapPoint {
  lat: number
  lng: number
}

export interface IMapStoreMarker extends IMapPoint {
  id: number | string
  label: string
}

export interface IStore {
  id: number
  name: string
  provinceCode: string | null
  address: string
  phone: string | null
  latitude: number
  longitude: number
  isActive: boolean
}

export interface IStoreRequest {
  name: string
  provinceCode: string | null
  address: string
  phone: string | null
  latitude: number
  longitude: number
  isActive: boolean
}

export interface IStoreInventory {
  productId: number
  productName: string
  amount: number
}

export interface IGeoPlace {
  displayName: string
  latitude: number
  longitude: number
}

export interface IShippingQuoteRequest {
  latitude?: number | null
  longitude?: number | null
  provinceCode: string
  wardCode: string
  address: string
  items: { productId: number; amount: number }[]
}

export interface IShippingQuote {
  storeId: number
  storeName: string
  storeAddress: string
  storeLatitude: number
  storeLongitude: number
  distanceKm: number
  durationMinutes: number
  estimated: boolean
  subtotal: number
  // Chi phí vận chuyển cửa hàng trả cho đơn vị vận chuyển; khách được miễn phí
  shippingFee: number
  total: number
}
