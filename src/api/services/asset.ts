import axiosInstance from '@/helpers/https'
import type { IUploadAssetResponse } from '@/api/models/asset'

export class AssetService {
  public static readonly uploadLogo: (formData: FormData) => Promise<IUploadAssetResponse> = async (
    formData,
  ) =>
    axiosInstance
      .post<IUploadAssetResponse>('/assets/upload-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      })
      .then((res) => res.data)

  public static readonly uploadBanners: (formData: FormData) => Promise<IUploadAssetResponse[]> =
    async (formData) =>
      axiosInstance
        .post<IUploadAssetResponse[]>('/assets/upload-banners', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000,
        })
        .then((res) => res.data)
}
