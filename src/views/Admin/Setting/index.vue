<template>
    <div class="setting-page">
        <div class="setting-header">
            <h1>Cài đặt logo và banner</h1>
            <p>Upload logo và banner để hiển thị trực tiếp trên trang chủ.</p>
        </div>

        <div class="setting-grid">
            <div class="setting-card">
                <h2>Upload Logo</h2>
                <div class="preview-box">
                    <img v-if="logoPreview" :src="logoPreview" alt="Logo preview" />
                    <div v-else class="preview-empty">Chưa có logo</div>
                </div>

                <a-form layout="vertical">
                    <a-form-item label="Chọn file logo">
                        <a-upload v-model:file-list="logoFileList" list-type="picture-card" :max-count="1"
                            :before-upload="handleLogoBeforeUpload"
                            :show-upload-list="{ showPreviewIcon: true, showRemoveIcon: true }"
                            @preview="handlePreview">
                            <div class="upload-placeholder">
                                <i class="pi pi-upload" />
                                <div>Chọn ảnh</div>
                            </div>
                        </a-upload>
                    </a-form-item>

                    <a-form-item>
                        <a-button type="primary" :loading="uploadingLogo" @click="uploadLogo">Upload logo</a-button>
                    </a-form-item>

                    <div v-if="savedLogoPublicId" class="asset-info">
                        <p><strong>Public ID hiện tại:</strong> {{ savedLogoPublicId }}</p>
                    </div>
                </a-form>
            </div>

            <div class="setting-card">
                <h2>Upload Banners</h2>
                <div class="preview-grid">
                    <div v-for="(image, index) in bannerPreviews" :key="index" class="preview-item">
                        <img :src="image" :alt="`Banner ${index + 1}`" />
                    </div>
                    <div v-if="bannerPreviews.length === 0" class="preview-empty">Chưa có banner</div>
                </div>

                <a-form layout="vertical">
                    <a-form-item label="Chọn file banner">
                        <a-upload v-model:file-list="bannerFileList" list-type="picture-card" multiple
                            :before-upload="handleBannerBeforeUpload"
                            :show-upload-list="{ showPreviewIcon: true, showRemoveIcon: true }"
                            @preview="handlePreview">
                            <div class="upload-placeholder">
                                <i class="pi pi-images" />
                                <div>Chọn ảnh</div>
                            </div>
                        </a-upload>
                    </a-form-item>

                    <a-form-item>
                        <a-button type="primary" :loading="uploadingBanners" @click="uploadBanners">
                            Upload banners
                        </a-button>
                    </a-form-item>

                    <div v-if="savedBannerPublicIds.length" class="asset-info">
                        <p><strong>Public IDs hiện tại:</strong></p>
                        <ul>
                            <li v-for="publicId in savedBannerPublicIds" :key="publicId">{{ publicId }}</li>
                        </ul>
                    </div>
                </a-form>
            </div>
        </div>

        <a-modal v-model:open="previewVisible" :title="previewTitle" :footer="null" @cancel="previewVisible = false">
            <img v-if="previewImage" :src="previewImage" alt="Preview" class="preview-modal-image" />
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
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

const logoPreview = computed(() => {
    if (savedLogoPublicId.value) {
        return getCloudinaryImageUrl(savedLogoPublicId.value)
    }
    return ''
})

const bannerPreviews = computed(() => {
    if (savedBannerPublicIds.value.length) {
        return savedBannerPublicIds.value.map((publicId) => getCloudinaryImageUrl(publicId))
    }
    return []
})

const loadSavedAssets = () => {
    savedLogoPublicId.value = defaultLogoPublicId || null
    savedBannerPublicIds.value = [...defaultBannerPublicIds]
}

const createPreviewUrl = (file: any) => {
    if (file.url) return file.url
    if (file.thumbUrl) return file.thumbUrl
    if (file.originFileObj) return URL.createObjectURL(file.originFileObj)
    return ''
}

const handleLogoBeforeUpload = (file: any) => {
    const isImage = file.type?.startsWith('image/')
    if (!isImage) {
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
    const isImage = file.type?.startsWith('image/')
    if (!isImage) {
        message.error('Chỉ hỗ trợ ảnh định dạng hình ảnh.')
        return false
    }

    const nextFile = {
        uid: file.uid,
        name: file.name,
        status: 'done',
        originFileObj: file,
        thumbUrl: URL.createObjectURL(file),
    }

    bannerFileList.value = [...bannerFileList.value, nextFile]
    return false
}

const handlePreview = async (file: any) => {
    previewImage.value = createPreviewUrl(file)
    previewTitle.value = file.name || 'Preview'
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
        if (defaultLogoPublicId) {
            formData.append('publicId', defaultLogoPublicId)
        }

        const response = await AssetService.uploadLogo(formData)
        savedLogoPublicId.value = response.publicId
        message.success('Upload logo thành công')
    } catch (error) {
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
        message.error('Upload banners thất bại')
    } finally {
        uploadingBanners.value = false
    }
}

onMounted(loadSavedAssets)
</script>

<style scoped>
.setting-page {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.setting-header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
}

.setting-header p {
    margin-top: 8px;
    color: #6b7280;
}

.setting-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
}

.setting-card {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.preview-box,
.preview-item {
    min-height: 160px;
    border: 1px dashed rgba(156, 163, 175, 0.4);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #f9fafb;
}

.preview-box img,
.preview-item img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.preview-empty {
    color: #6b7280;
    font-size: 14px;
}

.preview-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 16px;
}

.asset-info {
    margin-top: 16px;
    font-size: 14px;
    color: #374151;
}

.asset-info ul {
    list-style: inside disc;
    padding-left: 0;
    margin: 8px 0 0;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #6b7280;
}

.upload-placeholder .pi {
    font-size: 24px;
}

.preview-modal-image {
    width: 100%;
    max-height: 70vh;
    object-fit: contain;
    border-radius: 12px;
}

@media (max-width: 1024px) {
    .setting-grid {
        grid-template-columns: 1fr;
    }
}
</style>
