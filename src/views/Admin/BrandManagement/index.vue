<template>
    <div>
        <div class="mb-4 flex gap-2">
            <a-button type="primary" :icon="h(PlusOutlined)" @click="openCreateModal">
                Thêm
            </a-button>
            <a-button type="primary" danger :icon="h(DeleteOutlined)" :hidden="selectedRowKeys.length === 0"
                @click="handleDeleteSelected">
                Xóa
            </a-button>
        </div>

        <a-table :columns="columns" :data-source="brands" rowKey="id" :row-selection="rowSelection"
            :pagination="{ pageSize: 10 }">
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'image'">
                    <div class="flex items-center gap-3">
                        <a-avatar shape="square" size="large" :style="{ backgroundColor: '#f5f5f5' }">
                            {{ record.name?.charAt(0)?.toUpperCase() || 'B' }}
                        </a-avatar>
                        <span>{{ record.name }}</span>
                    </div>
                </template>
            </template>
        </a-table>

        <a-modal v-model:visible="createModalVisible" title="Tạo brand" okText="Tạo" cancelText="Hủy"
            @ok="handleCreateBrand" @cancel="closeCreateModal">
            <a-form ref="createFormRef" layout="vertical">
                <a-form-item label="Ảnh brand">
                    <a-upload accept="image/*" :custom-request="uploadImage" :show-upload-list="false">
                        <a-button type="default" :icon="h(UploadOutlined)">Chọn ảnh</a-button>
                    </a-upload>
                    <div v-if="imagePreview" class="mt-3">
                        <a-image width="80" :src="imagePreview" />
                    </div>
                    <div v-else class="mt-3 text-sm text-gray-500">
                        Ảnh chỉ để minh họa, hiện tại chưa lưu lên server.
                    </div>
                </a-form-item>

                <a-form-item label="Tên" name="name" required>
                    <a-input v-model:value="createForm.name" placeholder="Nhập tên brand" />
                </a-form-item>

                <a-form-item label="Slug" name="slug" required>
                    <a-input v-model:value="createForm.slug" placeholder="Nhập slug brand" />
                </a-form-item>

                <a-form-item label="Category" name="categoryId" required>
                    <a-select v-model:value="createForm.categoryId" placeholder="Chọn category">
                        <a-select-option v-for="category in categories" :key="category.id" :value="category.id">
                            {{ category.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { BrandService } from '@/api/services/brand'
import { CategoryService } from '@/api/services/category'
import { message } from 'ant-design-vue'
import { ref, reactive, computed, onMounted, h } from 'vue'
import { DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons-vue'
import type { FormInstance } from 'ant-design-vue'
import type { IGetBrandResponse } from '@/api/models/brand'
import type { IGetCategoryResponse } from '@/api/models/category'

const brands = ref<IGetBrandResponse[]>([])
const categories = ref<IGetCategoryResponse[]>([])
const selectedRowKeys = ref<number[]>([])
const createModalVisible = ref(false)
const createFormRef = ref<FormInstance | null>(null)
const imagePreview = ref<string | null>(null)
const selectedImageFile = ref<File | null>(null)

const createForm = reactive({
    name: '',
    slug: '',
    categoryId: null as number | null,
})

const columns = [
    {
        title: 'Hình ảnh',
        dataIndex: 'image',
        key: 'image',
        width: 150,
    },
    {
        title: 'Tên',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Slug',
        dataIndex: 'slug',
        key: 'slug',
    },
]

const rowSelection = computed(() => ({
    selectedRowKeys: selectedRowKeys.value,
    onChange: (newSelectedKeys: number[]) => {
        selectedRowKeys.value = newSelectedKeys
    },
}))

const loadBrands = async () => {
    try {
        brands.value = await BrandService.getAllBrands()
    } catch (error) {
        console.error(error)
        message.error('Không thể tải danh sách brand')
    }
}

const loadCategories = async () => {
    try {
        categories.value = await CategoryService.getAllCategories()
    } catch (error) {
        console.error(error)
        message.error('Không thể tải danh sách category')
    }
}

const openCreateModal = async () => {
    await loadCategories()
    createModalVisible.value = true
}

const closeCreateModal = () => {
    createModalVisible.value = false
    createForm.name = ''
    createForm.slug = ''
    createForm.categoryId = null
    imagePreview.value = null
    selectedImageFile.value = null
}

const handleCreateBrand = async () => {
    if (!createForm.name.trim() || !createForm.slug.trim() || !createForm.categoryId) {
        message.warning('Vui lòng điền đầy đủ tên, slug và category')
        return
    }

    try {
        await BrandService.createBrand(
            createForm.name.trim(),
            createForm.slug.trim(),
            createForm.categoryId,
        )
        message.success('Tạo brand thành công')
        closeCreateModal()
        await loadBrands()
    } catch (error) {
        console.error(error)
        message.error('Tạo brand thất bại')
    }
}

const handleDeleteSelected = async () => {
    if (selectedRowKeys.value.length === 0) {
        return
    }

    try {
        await Promise.all(selectedRowKeys.value.map((id) => BrandService.deleteBrand(id)))
        message.success('Xóa brand thành công')
        selectedRowKeys.value = []
        await loadBrands()
    } catch (error) {
        console.error(error)
        message.error('Xóa brand thất bại')
    }
}

const uploadImage = async ({ file, onSuccess }: any) => {
    selectedImageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
    onSuccess?.({}, file)
}

onMounted(() => {
    loadBrands()
})
</script>

<style scoped>
.mb-4 {
    margin-bottom: 16px;
}
</style>
