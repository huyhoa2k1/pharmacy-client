<template>
    <div class="admin-product-create">
        <a-page-header :title="t('adminProductCreate.pageTitle')" />

        <a-card>
            <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" class="product-form">
                <a-row :gutter="24">
                    <a-col :span="12">
                        <a-form-item :label="t('adminProductCreate.nameLabel')" name="name">
                            <a-input v-model:value="form.name" :placeholder="t('adminProductCreate.namePlaceholder')" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <a-form-item :label="t('adminProductCreate.brandLabel')" name="brandId">
                            <a-select v-model:value="form.brandId"
                                :placeholder="t('adminProductCreate.brandPlaceholder')" :options="brandOptions"
                                allow-clear />
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <a-form-item :label="t('adminProductCreate.priceLabel')" name="price">
                            <a-input-number v-model:value="form.price" :min="0" style="width: 100%"
                                :formatter="priceFormatter" :parser="priceParser"
                                :placeholder="t('adminProductCreate.pricePlaceholder')" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <a-form-item :label="t('adminProductCreate.discountLabel')" name="discount">
                            <a-input-number v-model:value="form.discount" :min="0" :max="100" style="width: 100%"
                                :placeholder="t('adminProductCreate.discountPlaceholder')" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <a-form-item :label="t('adminProductCreate.quantityLabel')" name="amount">
                            <a-input-number v-model:value="form.amount" :min="0" style="width: 100%"
                                :placeholder="t('adminProductCreate.quantityPlaceholder')" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="24">
                        <a-form-item :label="t('adminProductCreate.descriptionLabel')" name="description">
                            <ckeditor :editor="Editor" v-model:modelValue="form.description" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="24">
                        <a-form-item :label="t('adminProductCreate.imagesLabel')" name="images">
                            <a-upload :file-list="fileList" :before-upload="beforeUpload"
                                :on-change="handleUploadChange" :on-preview="handlePreview" :multiple="true"
                                :show-upload-list="{ showPreviewIcon: true, showRemoveIcon: true }"
                                list-type="picture-card">
                                <div>
                                    <span>{{ t('adminProductCreate.uploadButton') }}</span>
                                </div>
                            </a-upload>
                        </a-form-item>
                    </a-col>

                    <a-col :span="24" class="form-actions">
                        <a-button type="primary" @click="submitForm" :loading="submitting">
                            {{ t('adminProductCreate.save') }}
                        </a-button>
                        <a-button class="ml-2" @click="resetForm">{{ t('adminProductCreate.reset') }}</a-button>
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
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()
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

const rules = computed(() => ({
    name: [{ required: true, message: t('adminProductCreate.nameRequired'), trigger: 'blur' }],
    description: [{ required: true, message: t('adminProductCreate.descriptionRequired'), trigger: 'blur' }],
    price: [
        { required: true, message: t('adminProductCreate.priceRequired'), trigger: 'blur' },
        {
            validator: (_rule: unknown, value: number) =>
                value === null || value === undefined || value < 0
                    ? Promise.reject(new Error(t('adminProductCreate.priceMin')))
                    : Promise.resolve(),
            trigger: 'blur',
        },
    ],
    discount: [
        { required: true, message: t('adminProductCreate.discountRequired'), trigger: 'blur' },
        {
            validator: (_rule: unknown, value: number) =>
                value === null || value === undefined || value < 0 || value > 100
                    ? Promise.reject(new Error(t('adminProductCreate.discountRange')))
                    : Promise.resolve(),
            trigger: 'blur',
        },
    ],
    amount: [
        { required: true, message: t('adminProductCreate.quantityRequired'), trigger: 'blur' },
        {
            validator: (_rule: unknown, value: number) =>
                value === null || value === undefined || value < 0
                    ? Promise.reject(new Error(t('adminProductCreate.quantityMin')))
                    : Promise.resolve(),
            trigger: 'blur',
        },
    ],
    brandId: [{ required: true, message: t('adminProductCreate.brandRequired'), trigger: 'change' }],
}))

const brandOptions = computed(() =>
    brands.value.map((brand) => ({ label: brand.name, value: brand.id })),
)

const Editor = ClassicEditor

const fetchBrands = async () => {
    try {
        brands.value = await BrandService.getAllBrands()
    } catch {
        message.error(t('adminProductCreate.brandsLoadError'))
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
        message.error(t('adminProductCreate.imagesRequired'))
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

    previewTitle.value = file.name || t('adminProductCreate.previewFallbackTitle')
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
        message.success(t('adminProductCreate.createSuccess'))
        router.push({ name: 'admin-products-management' })
    } catch {
        message.error(t('adminProductCreate.createFailed'))
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