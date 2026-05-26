export interface IGetProvinceResponse {
  id: number
  name: string
  provinceCode: string
  locationSlug: string
  legacyAddress: string
}

export interface IGetWardResponse extends IGetProvinceResponse {
  wardCode: string
}
