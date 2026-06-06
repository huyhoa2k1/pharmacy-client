<template>
    <div class="admin-product-create">
        <a-page-header title="Thêm sản phẩm mới" />

        <a-card>
            <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" class="product-form">
                <a-row :gutter="24">
                    <a-col :span="12">
                        <a-form-item label="Tên sản phẩm" name="name">
                            <a-input v-model:value="form.name" placeholder="Tên sản phẩm" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <a-form-item label="Thương hiệu" name="brandId">
                            <a-select v-model:value="form.brandId" placeholder="Chọn thương hiệu"
                                :options="brandOptions" allow-clear />
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <a-form-item label="Giá bán" name="price">
                            <a-input-number v-model:value="form.price" :min="0" style="width: 100%"
                                :formatter="priceFormatter" :parser="priceParser" placeholder="Giá bán" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <a-form-item label="Giảm giá (%)" name="discount">
                            <a-input-number v-model:value="form.discount" :min="0" :max="100" style="width: 100%"
                                placeholder="Tỷ lệ giảm giá" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <a-form-item label="Số lượng" name="amount">
                            <a-input-number v-model:value="form.amount" :min="0" style="width: 100%"
                                placeholder="Số lượng tồn kho" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="24">
                        <a-form-item label="Mô tả" name="description">
                            <ckeditor :editor="Editor" v-model:modelValue="form.description" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="24">
                        <a-form-item label="Ảnh sản phẩm" name="images">
                            <a-upload :file-list="fileList" :before-upload="beforeUpload"
                                :on-change="handleUploadChange" :on-preview="handlePreview" :multiple="true"
                                :show-upload-list="{ showPreviewIcon: true, showRemoveIcon: true }"
                                list-type="picture-card">
                                <div>
                                    <span>Tải lên</span>
                                </div>
                            </a-upload>
                        </a-form-item>
                    </a-col>

                    <a-col :span="24" class="form-actions">
                        <a-button type="primary" @click="submitForm" :loading="submitting">
                            Lưu sản phẩm
                        </a-button>
                        <a-button class="ml-2" @click="resetForm">Đặt lại</a-button>
                    </a-col>
                </a-row>
            </a-form>
        </a-card>

        <a-modal v-model:visible="previewVisible" :title="previewTitle" footer="null" @cancel="handleCancelPreview">
            <img v-if="previewImage" :src="previewImage" alt="preview" style="width: 100%" />
        </a-modal>
    </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AdminProductCreate' })

import type { FormInstance } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { BrandService } from '@/api/services/brand'
import { ProductService } from '@/api/services/product'
import type { IGetBrandResponse } from '@/api/models/brand'
import type { ICreateProductRequest } from '@/api/models/product'

type UploadItem = {
    originFileObj?: File
    uid?: string
    name?: string
    status?: string
    url?: string
}

const router = useRouter()
const formRef = ref<FormInstance | null>(null)
const submitting = ref(false)
const brands = ref<IGetBrandResponse[]>([])
const fileList = ref<UploadItem[]>([])

const form = reactive({
    name: '',
    description: '',
    price: null as number | null,
    discount: null as number | null,
    amount: null as number | null,
    brandId: null as number | null,
})

const previewVisible = ref(false)
const previewImage = ref('')
const previewTitle = ref('')

const rules = {
    name: [{ required: true, message: 'Tên sản phẩm là bắt buộc', trigger: 'blur' }],
    description: [{ required: true, message: 'Mô tả là bắt buộc', trigger: 'blur' }],
    price: [
        { required: true, message: 'Giá bán là bắt buộc', trigger: 'blur' },
        {
            validator: (_rule: unknown, value: number) =>
                value === null || value === undefined || value < 0
                    ? Promise.reject(new Error('Giá phải lớn hơn hoặc bằng 0'))
                    : Promise.resolve(),
            trigger: 'blur',
        },
    ],
    discount: [
        { required: true, message: 'Giảm giá là bắt buộc', trigger: 'blur' },
        {
            validator: (_rule: unknown, value: number) =>
                value === null || value === undefined || value < 0 || value > 100
                    ? Promise.reject(new Error('Giảm giá phải từ 0 đến 100'))
                    : Promise.resolve(),
            trigger: 'blur',
        },
    ],
    amount: [
        { required: true, message: 'Số lượng là bắt buộc', trigger: 'blur' },
        {
            validator: (_rule: unknown, value: number) =>
                value === null || value === undefined || value < 0
                    ? Promise.reject(new Error('Số lượng phải lớn hơn hoặc bằng 0'))
                    : Promise.resolve(),
            trigger: 'blur',
        },
    ],
    brandId: [{ required: true, message: 'Vui lòng chọn thương hiệu', trigger: 'change' }],
}

const brandOptions = computed(() =>
    brands.value.map((brand) => ({ label: brand.name, value: brand.id })),
)

const Editor = ClassicEditor

const fetchBrands = async () => {
    try {
        brands.value = await BrandService.getAllBrands()
    } catch {
        message.error('Không tải được danh sách thương hiệu')
    }
}

const beforeUpload = () => false

const handleUploadChange = ({ fileList: newList }: { fileList: UploadItem[] }) => {
    fileList.value = newList
}

const buildSlug = (name: string) =>
    name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

const priceFormatter = (value: number | string) => {
    if (value === undefined || value === null) {
        return ''
    }
    const stringValue = String(value)
    return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const priceParser = (value: string) => Number(value.replace(/\D/g, ''))

const validateImages = () => {
    if (fileList.value.length === 0) {
        message.error('Vui lòng tải lên ít nhất một ảnh')
        return false
    }
    return true
}

const handlePreview = async (file: UploadItem) => {
    if (file.url) {
        previewImage.value = file.url
    } else if (file.originFileObj instanceof File) {
        previewImage.value = URL.createObjectURL(file.originFileObj)
    } else {
        previewImage.value = ''
    }

    previewTitle.value = file.name || 'Ảnh xem trước'
    previewVisible.value = true
}

const handleCancelPreview = () => {
    previewVisible.value = false
    previewImage.value = ''
}

const resetForm = () => {
    form.name = ''
    form.description = ''
    form.price = null
    form.discount = null
    form.amount = null
    form.brandId = null
    fileList.value = []
    formRef.value?.resetFields()
}

const submitForm = async () => {
    if (!formRef.value) {
        return
    }

    try {
        await formRef.value.validate()
        if (!validateImages()) {
            return
        }

        submitting.value = true
        const files = fileList.value.map((file) => file.originFileObj || file) as File[]
        const uploadForm = new FormData()
        files.forEach((file) => uploadForm.append('files', file))

        const imageUrl = await ProductService.uploadProductImages(uploadForm)

        const payload: ICreateProductRequest = {
            slug: buildSlug(form.name),
            name: form.name,
            description: form.description,
            price: form.price ?? 0,
            discount: form.discount ?? 0,
            amount: form.amount ?? 0,
            brandId: form.brandId ?? 0,
            imageUrl,
        }

        await ProductService.createProduct(payload)
        message.success('Tạo sản phẩm thành công')
        router.push({ name: 'admin-products-management' })
    } catch {
        message.error('Tạo sản phẩm thất bại. Vui lòng kiểm tra lại thông tin.')
    } finally {
        submitting.value = false
    }
}

onMounted(() => {
    fetchBrands()
})
</script>

<style scoped>
.product-form :deep(.ant-form-item-label) {
    font-weight: 600;
}

.form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}
</style>