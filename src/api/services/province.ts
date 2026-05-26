import axiosInstance from '@/helpers/https'
import type { IGetProvinceResponse, IGetWardResponse } from '../models/province'

export class ProvinceService {
  public static readonly getProvinces: () => Promise<IGetProvinceResponse[]> = async () =>
    axiosInstance.get<IGetProvinceResponse[]>('/provinces').then((res) => res.data)

  public static readonly getWardsByProvince: (provinceCode: string) => Promise<IGetWardResponse[]> =
    async (provinceCode) =>
      axiosInstance
        .get<IGetWardResponse[]>(`/wards?provinceCode=${provinceCode}`)
        .then((res) => res.data)
}
