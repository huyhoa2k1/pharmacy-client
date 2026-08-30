<template>
  <div class="entity-management">
    <AdminTableToolbar>
      <template #search>
        <AdminSearch
          v-model="searchText"
          label="Tìm thương hiệu"
          placeholder="Tìm tên hoặc slug thương hiệu..."
          @search="resetPage"
        />
      </template>
      <template #filters>
        <AdminFilterBar label="Lọc thương hiệu" @reset="categoryFilter = 'all'">
          <a-select
            v-model:value="categoryFilter"
            aria-label="Lọc theo danh mục"
            class="brand-filter"
            :options="categoryFilterOptions"
          />
          <template #reset>Xóa lọc</template>
        </AdminFilterBar>
      </template>
      <template #actions>
        <a-button type="primary" :icon="h(PlusOutlined)" @click="openCreateModal"
          >Thêm thương hiệu</a-button
        >
      </template>
    </AdminTableToolbar>

    <div v-if="selectedRowKeys.length" class="selection-bar" role="status">
      <span
        ><strong>{{ selectedRowKeys.length }}</strong> thương hiệu đã chọn</span
      >
      <div>
        <a-button danger :icon="h(DeleteOutlined)" @click="confirmDeleteSelected"
          >Xóa đã chọn</a-button
        ><a-button type="link" @click="selectedRowKeys = []">Bỏ chọn</a-button>
      </div>
    </div>

    <AdminLoadingState v-if="loading" label="Đang tải thương hiệu..." />
    <AdminErrorState
      v-else-if="loadError"
      title="Không thể tải thương hiệu"
      description="Vui lòng kiểm tra kết nối và thử lại."
      @retry="loadBrands"
      ><template #action>Thử tải lại</template></AdminErrorState
    >
    <AdminEmptyState
      v-else-if="!filteredBrands.length"
      :title="hasActiveFilters ? 'Không tìm thấy thương hiệu' : 'Chưa có thương hiệu'"
      :description="
        hasActiveFilters
          ? 'Thử thay đổi từ khóa hoặc bộ lọc.'
          : 'Hãy thêm thương hiệu đầu tiên để bắt đầu.'
      "
    >
      <template #action
        ><a-button v-if="hasActiveFilters" type="primary" @click="resetFilters">Xóa bộ lọc</a-button
        ><a-button v-else type="primary" @click="openCreateModal"
          >Thêm thương hiệu</a-button
        ></template
      >
    </AdminEmptyState>
    <AdminDataTable
      v-else
      :columns="columns"
      :data-source="paginatedBrands"
      row-key="id"
      :row-selection="rowSelection"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'name'">
          <div class="entity-cell">
            <a-avatar shape="square" :size="40">{{ record.name.charAt(0).toUpperCase() }}</a-avatar>
            <div>
              <strong>{{ record.name }}</strong
              ><span>#{{ record.id }}</span>
            </div>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'categoryId'"
          ><span class="category-reference">Danh mục #{{ record.categoryId }}</span></template
        >
        <template v-else-if="column.key === 'action'"
          ><AdminActionMenu
            :items="[{ key: 'delete', label: 'Xóa thương hiệu', danger: true }]"
            label="Thao tác thương hiệu"
            @select="handleRowAction(record, $event)"
        /></template>
      </template>
      <template #pagination
        ><AdminPagination
          :current="currentPage"
          :page-size="pageSize"
          :total="filteredBrands.length"
          @change="handlePageChange"
          @size-change="handlePageSizeChange"
      /></template>
    </AdminDataTable>

    <AdminModal
      :open="createModalVisible"
      title="Tạo thương hiệu"
      ok-text="Tạo thương hiệu"
      :loading="creating"
      @update:open="createModalVisible = $event"
      @confirm="handleCreateBrand"
      @cancel="closeCreateModal"
    >
      <a-form layout="vertical">
        <a-form-item label="Ảnh minh họa"
          ><a-upload accept="image/*" :custom-request="uploadImage" :show-upload-list="false"
            ><a-button :icon="h(UploadOutlined)">Chọn ảnh</a-button></a-upload
          ><a-image
            v-if="imagePreview"
            class="preview"
            width="80"
            :src="imagePreview"
            alt="Ảnh thương hiệu đã chọn"
          />
          <p v-else class="field-help">
            Ảnh chỉ dùng để xem trước và chưa được lưu lên máy chủ.
          </p></a-form-item
        >
        <a-form-item label="Tên thương hiệu" name="name" required
          ><a-input v-model:value="createForm.name" placeholder="Nhập tên thương hiệu"
        /></a-form-item>
        <a-form-item label="Slug" name="slug" required
          ><a-input v-model:value="createForm.slug" placeholder="Nhập slug thương hiệu"
        /></a-form-item>
        <a-form-item label="Danh mục" name="categoryId" required
          ><a-select
            v-model:value="createForm.categoryId"
            placeholder="Chọn danh mục"
            :options="categoryOptions"
        /></a-form-item>
      </a-form>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
import { BrandService } from '@/api/services/brand'
import { CategoryService } from '@/api/services/category'
import type { IGetBrandResponse } from '@/api/models/brand'
import type { IGetCategoryResponse } from '@/api/models/category'
import {
  AdminActionMenu,
  AdminDataTable,
  AdminEmptyState,
  AdminErrorState,
  AdminFilterBar,
  AdminLoadingState,
  AdminModal,
  AdminPagination,
  AdminSearch,
  AdminTableToolbar,
} from '@/components/Admin'
import { message, Modal } from 'ant-design-vue'
import { computed, h, onMounted, reactive, ref, watch } from 'vue'
import { DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons-vue'

const brands = ref<IGetBrandResponse[]>([])
const categories = ref<IGetCategoryResponse[]>([])
const selectedRowKeys = ref<number[]>([])
const createModalVisible = ref(false)
const imagePreview = ref<string | null>(null)
const selectedImageFile = ref<File | null>(null)
const searchText = ref('')
const categoryFilter = ref<number | 'all'>('all')
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(true)
const loadError = ref(false)
const creating = ref(false)
const createForm = reactive({ name: '', slug: '', categoryId: null as number | null })

const columns = [
  {
    title: 'Thương hiệu',
    dataIndex: 'name',
    key: 'name',
    width: 320,
    sorter: (a: IGetBrandResponse, b: IGetBrandResponse) => a.name.localeCompare(b.name),
  },
  { title: 'Slug', dataIndex: 'slug', key: 'slug', width: 280 },
  { title: 'Danh mục', dataIndex: 'categoryId', key: 'categoryId', width: 180 },
  { title: 'Thao tác', key: 'action', width: 96, fixed: 'right' },
]
const categoryOptions = computed(() =>
  categories.value.map((category) => ({ label: category.name, value: category.id })),
)
const categoryFilterOptions = computed(() => [
  { label: 'Tất cả danh mục', value: 'all' },
  ...categoryOptions.value,
])
const filteredBrands = computed(() => {
  const keyword = searchText.value.trim().toLocaleLowerCase('vi-VN')
  return brands.value.filter(
    (brand) =>
      (!keyword ||
        [brand.name, brand.slug, String(brand.id)].some((value) =>
          value.toLocaleLowerCase('vi-VN').includes(keyword),
        )) &&
      (categoryFilter.value === 'all' || brand.categoryId === categoryFilter.value),
  )
})
const paginatedBrands = computed(() =>
  filteredBrands.value.slice(
    (currentPage.value - 1) * pageSize.value,
    currentPage.value * pageSize.value,
  ),
)
const hasActiveFilters = computed(
  () => Boolean(searchText.value.trim()) || categoryFilter.value !== 'all',
)
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: number[]) => {
    selectedRowKeys.value = keys
  },
}))

const loadBrands = async () => {
  loading.value = true
  loadError.value = false
  try {
    brands.value = await BrandService.getAllBrands()
  } catch (error) {
    console.error(error)
    loadError.value = true
    message.error('Không thể tải danh sách brand')
  } finally {
    loading.value = false
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
  creating.value = true
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
  } finally {
    creating.value = false
  }
}
const deleteBrands = async (ids: number[]) => {
  try {
    await Promise.all(ids.map((id) => BrandService.deleteBrand(id)))
    message.success('Xóa brand thành công')
    selectedRowKeys.value = []
    await loadBrands()
  } catch (error) {
    console.error(error)
    message.error('Xóa brand thất bại')
  }
}
const confirmDelete = (ids: number[]) =>
  Modal.confirm({
    title: 'Xóa thương hiệu đã chọn?',
    content: `Bạn sắp xóa ${ids.length} thương hiệu. Thao tác này không thể hoàn tác.`,
    okText: 'Xóa thương hiệu',
    okButtonProps: { danger: true },
    cancelText: 'Hủy',
    onOk: () => deleteBrands(ids),
  })
const confirmDeleteSelected = () => confirmDelete(selectedRowKeys.value)
const handleRowAction = (brand: IGetBrandResponse, action: string) => {
  if (action === 'delete') confirmDelete([brand.id])
}
const uploadImage = async ({
  file,
  onSuccess,
}: {
  file: File
  onSuccess?: (response: unknown, file: File) => void
}) => {
  selectedImageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
  onSuccess?.({}, file)
}
const resetPage = () => {
  currentPage.value = 1
}
const resetFilters = () => {
  searchText.value = ''
  categoryFilter.value = 'all'
  resetPage()
}
const handlePageChange = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
}
const handlePageSizeChange = (_current: number, size: number) => {
  pageSize.value = size
  resetPage()
}

watch([searchText, categoryFilter, pageSize], resetPage)
onMounted(async () => {
  await Promise.all([loadBrands(), loadCategories()])
})
</script>

<style scoped>
.brand-filter {
  width: min(100%, 210px);
}
.selection-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  padding: var(--space-md);
  border: 1px solid color-mix(in srgb, var(--color-primary) 35%, var(--color-card));
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-primary) 8%, var(--color-card));
}
.selection-bar > div {
  display: flex;
  gap: var(--space-sm);
}
.entity-cell {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-width: 190px;
}
.entity-cell :deep(.ant-avatar) {
  background: var(--color-muted);
  color: var(--color-primary);
  font-weight: 700;
}
.entity-cell div {
  display: grid;
  gap: 2px;
}
.entity-cell span,
.field-help,
.category-reference {
  margin: var(--space-sm) 0 0;
  color: var(--color-muted-foreground);
  font-size: 0.8125rem;
}
.preview {
  display: block;
  margin-top: var(--space-md);
}
@media (max-width: 640px) {
  .brand-filter {
    width: 100%;
  }
  .selection-bar,
  .selection-bar > div {
    align-items: stretch;
    flex-direction: column;
  }
  .selection-bar :deep(.ant-btn) {
    width: 100%;
  }
}
</style>
