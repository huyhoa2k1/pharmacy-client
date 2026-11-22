import axiosInstance from '@/helpers/https'
import type { IGetProvinceResponse, IGetWardResponse } from '../models/province'
import type { IPageResponse } from '../models/product'
import type { IPagerRequest } from '../models/pager'
import { fetchAllPages } from './pager'

export interface IProvinceQueryRequest {
  pager?: IPagerRequest
}

export interface IWardQueryRequest {
  provinceCode?: string
  pager?: IPagerRequest
}

export class ProvinceService {
  public static readonly getProvincesPage: (
    request: IProvinceQueryRequest,
  ) => Promise<IPageResponse<IGetProvinceResponse>> = async (request) =>
    axiosInstance.post('/provinces/getAllProvinces', request).then((res) => res.data)

  public static readonly getProvinces: () => Promise<IGetProvinceResponse[]> = async () =>
    fetchAllPages(ProvinceService.getProvincesPage, {})

  public static readonly getWardsPage: (
    request: IWardQueryRequest,
  ) => Promise<IPageResponse<IGetWardResponse>> = async (request) =>
    axiosInstance.post('/wards/getAllWards', request).then((res) => res.data)

  public static readonly getWardsByProvince: (provinceCode: string) => Promise<IGetWardResponse[]> =
    async (provinceCode) => fetchAllPages(ProvinceService.getWardsPage, { provinceCode })

  public static readonly importWardsByProvince: (
    provinceCode: string,
    payload: any[],
  ) => Promise<boolean> = async (provinceCode, payload) =>
    axiosInstance
      .post<boolean>(`/provinces/${provinceCode}/wards/import`, payload)
      .then((res) => res.data)
}
