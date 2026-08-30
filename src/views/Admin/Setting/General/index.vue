<template>
  <div class="settings-page">
    <header class="settings-intro">
      <p class="settings-intro__eyebrow">Nhận diện thương hiệu</p>
      <h1>Cài đặt logo và banner</h1>
      <p>Quản lý hình ảnh hiển thị trên trang chủ Online Pharmacy.</p>
    </header>

    <div class="asset-grid">
      <AdminFormSection
        title="Logo thương hiệu"
        description="Dùng một hình ảnh đại diện cho toàn bộ trang web."
      >
        <div class="logo-preview asset-preview">
          <img v-if="logoPreview" :src="logoPreview" alt="Logo hiện tại" />
          <div v-else class="asset-preview__empty">
            <i class="pi pi-image" aria-hidden="true" /><span>Chưa có logo</span>
          </div>
        </div>
        <a-form layout="vertical" class="asset-form">
          <a-form-item label="Chọn file logo">
            <a-upload
              v-model:file-list="logoFileList"
              list-type="picture-card"
              :max-count="1"
              :before-upload="handleLogoBeforeUpload"
              :show-upload-list="{ showPreviewIcon: true, showRemoveIcon: true }"
              @preview="handlePreview"
            >
              <div class="upload-placeholder">
                <i class="pi pi-upload" aria-hidden="true" /><span>Chọn ảnh</span>
              </div>
            </a-upload>
          </a-form-item>
          <a-button type="primary" :loading="uploadingLogo" @click="uploadLogo">Lưu logo</a-button>
        </a-form>
        <details v-if="savedLogoPublicId" class="asset-details">
          <summary>Thông tin kỹ thuật</summary>
          <code>{{ savedLogoPublicId }}</code>
        </details>
      </AdminFormSection>

      <AdminFormSection
        title="Banner trang chủ"
        description="Chọn một hoặc nhiều banner để cập nhật phần giới thiệu."
      >
        <div v-if="bannerPreviews.length" class="banner-preview-grid">
          <button
            v-for="(image, index) in bannerPreviews"
            :key="image"
            class="banner-preview"
            type="button"
            :aria-label="`Xem banner ${index + 1}`"
            @click="openSavedPreview(image, `Banner ${index + 1}`)"
          >
            <img :src="image" :alt="`Banner ${index + 1}`" />
          </button>
        </div>
        <div v-else class="asset-preview asset-preview--banner">
          <div class="asset-preview__empty">
            <i class="pi pi-images" aria-hidden="true" /><span>Chưa có banner</span>
          </div>
        </div>
        <a-form layout="vertical" class="asset-form">
          <a-form-item label="Chọn file banner">
            <a-upload
              v-model:file-list="bannerFileList"
              list-type="picture-card"
              multiple
              :before-upload="handleBannerBeforeUpload"
              :show-upload-list="{ showPreviewIcon: true, showRemoveIcon: true }"
              @preview="handlePreview"
            >
              <div class="upload-placeholder">
                <i class="pi pi-images" aria-hidden="true" /><span>Chọn ảnh</span>
              </div>
            </a-upload>
          </a-form-item>
          <a-button type="primary" :loading="uploadingBanners" @click="uploadBanners"
            >Lưu banner</a-button
          >
        </a-form>
        <details v-if="savedBannerPublicIds.length" class="asset-details">
          <summary>Thông tin kỹ thuật</summary>
          <ul>
            <li v-for="publicId in savedBannerPublicIds" :key="publicId">
              <code>{{ publicId }}</code>
            </li>
          </ul>
        </details>
      </AdminFormSection>
    </div>

    <a-modal
      v-model:open="previewVisible"
      :title="previewTitle"
      :footer="null"
      @cancel="previewVisible = false"
    >
      <img
        v-if="previewImage"
        :src="previewImage"
        :alt="previewTitle"
        class="preview-modal-image"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { AdminFormSection } from '@/components/Admin'
import { AssetService } from '@/api/services/asset'
import { getCloudinaryImageUrl } from '@/utils/cloudinary'
import { LOGO_PUBLIC_ID, BANNER_PUBLIC_IDS } from '@/config/assetConfig'

const logoFileList = ref<any[]>([])
const bannerFileList = ref<any[]>([])
const uploadingLogo = ref(false)
const uploadingBanners = ref(false)
const savedLogoPublicId = ref<string | null>(null)
const savedBannerPublicIds = ref<string[]>([])
const defaultLogoPublicId = LOGO_PUBLIC_ID
const defaultBannerPublicIds = BANNER_PUBLIC_IDS
const previewVisible = ref(false)
const previewImage = ref('')
const previewTitle = ref('')

const logoPreview = computed(() =>
  savedLogoPublicId.value ? getCloudinaryImageUrl(savedLogoPublicId.value) : '',
)
const bannerPreviews = computed(() =>
  savedBannerPublicIds.value.map((publicId) => getCloudinaryImageUrl(publicId)),
)
const loadSavedAssets = () => {
  savedLogoPublicId.value = defaultLogoPublicId || null
  savedBannerPublicIds.value = [...defaultBannerPublicIds]
}
const createPreviewUrl = (file: any) =>
  file.url || file.thumbUrl || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : '')
const handleLogoBeforeUpload = (file: any) => {
  if (!file.type?.startsWith('image/')) {
    message.error('Chỉ hỗ trợ ảnh định dạng hình ảnh.')
    return false
  }
  logoFileList.value = [
    {
      uid: file.uid,
      name: file.name,
      status: 'done',
      originFileObj: file,
      thumbUrl: URL.createObjectURL(file),
    },
  ]
  return false
}
const handleBannerBeforeUpload = (file: any) => {
  if (!file.type?.startsWith('image/')) {
    message.error('Chỉ hỗ trợ ảnh định dạng hình ảnh.')
    return false
  }
  bannerFileList.value = [
    ...bannerFileList.value,
    {
      uid: file.uid,
      name: file.name,
      status: 'done',
      originFileObj: file,
      thumbUrl: URL.createObjectURL(file),
    },
  ]
  return false
}
const handlePreview = async (file: any) => {
  previewImage.value = createPreviewUrl(file)
  previewTitle.value = file.name || 'Xem trước hình ảnh'
  previewVisible.value = true
}
const openSavedPreview = (image: string, title: string) => {
  previewImage.value = image
  previewTitle.value = title
  previewVisible.value = true
}
const uploadLogo = async () => {
  const file = logoFileList.value[0]?.originFileObj as File | undefined
  if (!file) {
    message.warning('Vui lòng chọn file logo trước khi upload.')
    return
  }
  uploadingLogo.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    if (defaultLogoPublicId) formData.append('publicId', defaultLogoPublicId)
    const response = await AssetService.uploadLogo(formData)
    savedLogoPublicId.value = response.publicId
    message.success('Upload logo thành công')
  } catch (error) {
    console.error(error)
    message.error('Upload logo thất bại')
  } finally {
    uploadingLogo.value = false
  }
}
const uploadBanners = async () => {
  const files = bannerFileList.value
    .map((item) => item.originFileObj as File | undefined)
    .filter((file): file is File => Boolean(file))
  if (!files.length) {
    message.warning('Vui lòng chọn ít nhất một file banner.')
    return
  }
  uploadingBanners.value = true
  try {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    defaultBannerPublicIds.forEach((publicId) => formData.append('publicIds', publicId))
    const response = await AssetService.uploadBanners(formData)
    savedBannerPublicIds.value = response.map((item) => item.publicId)
    message.success('Upload banners thành công')
  } catch (error) {
    console.error(error)
    message.error('Upload banners thất bại')
  } finally {
    uploadingBanners.value = false
  }
}

onMounted(loadSavedAssets)
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}
.settings-intro__eyebrow {
  margin: 0 0 var(--space-xs);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.settings-intro h1 {
  margin: 0;
  font-size: clamp(1.5rem, 2vw, 2rem);
}
.settings-intro > p:last-child {
  margin: var(--space-sm) 0 0;
  color: var(--color-muted-foreground);
}
.asset-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-xl);
}
.asset-preview {
  display: grid;
  min-height: 180px;
  place-items: center;
  overflow: hidden;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-muted) 45%, var(--color-card));
}
.asset-preview img {
  width: 100%;
  height: 180px;
  object-fit: contain;
}
.asset-preview__empty {
  display: grid;
  justify-items: center;
  gap: var(--space-sm);
  color: var(--color-muted-foreground);
}
.asset-preview__empty .pi {
  color: var(--color-primary);
  font-size: 1.5rem;
}
.asset-form {
  margin-top: var(--space-lg);
}
.upload-placeholder {
  display: grid;
  justify-items: center;
  gap: 6px;
  color: var(--color-muted-foreground);
}
.upload-placeholder .pi {
  font-size: 1.25rem;
}
.banner-preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-sm);
}
.banner-preview {
  min-height: 112px;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-muted);
  cursor: zoom-in;
}
.banner-preview:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-ring) 35%, transparent);
  outline-offset: 2px;
}
.banner-preview img {
  width: 100%;
  height: 112px;
  object-fit: cover;
}
.asset-preview--banner {
  min-height: 180px;
}
.asset-details {
  margin-top: var(--space-lg);
  color: var(--color-muted-foreground);
  font-size: 0.8125rem;
}
.asset-details summary {
  cursor: pointer;
  font-weight: 700;
}
.asset-details code {
  display: inline-block;
  margin-top: var(--space-sm);
  overflow-wrap: anywhere;
}
.asset-details ul {
  padding-left: var(--space-lg);
}
.preview-modal-image {
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: var(--radius-sm);
}
@media (max-width: 1024px) {
  .asset-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .banner-preview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
