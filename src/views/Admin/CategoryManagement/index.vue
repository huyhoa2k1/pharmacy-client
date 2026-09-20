<template>
  <div class="entity-management">
    <AdminTableToolbar>
      <template #search>
        <AdminSearch v-model="searchText" :label="t('adminCategories.searchLabel')"
          :placeholder="t('adminCategories.searchPlaceholder')" @search="resetPage" />
      </template>
      <template #actions>
        <a-button type="primary" :icon="h(PlusOutlined)" @click="openCreateModal">{{ t('adminCategories.addCategory')
          }}</a-button>
      </template>
    </AdminTableToolbar>

    <div v-if="selectedRowKeys.length" class="selection-bar" role="status">
      <span>{{ t('adminCategories.selectedCount', { count: selectedRowKeys.length }) }}</span>
      <div>
        <a-button danger :icon="h(DeleteOutlined)" @click="confirmDeleteSelected">{{ t('adminCategories.deleteSelected')
          }}</a-button>
        <a-button type="link" @click="selectedRowKeys = []">{{ t('adminCategories.deselect') }}</a-button>
      </div>
    </div>

    <AdminLoadingState v-if="loading" :label="t('adminCategories.loading')" />
    <AdminErrorState v-else-if="loadError" :title="t('adminCategories.loadErrorTitle')"
      :description="t('adminCategories.loadErrorDescription')" @retry="loadCategories">
      <template #action>{{ t('adminCategories.reloadAction') }}</template>
    </AdminErrorState>
    <AdminEmptyState v-else-if="!filteredCategories.length"
      :title="searchText ? t('adminCategories.emptyTitleFiltered') : t('adminCategories.emptyTitleDefault')"
      :description="searchText
          ? t('adminCategories.emptyDescFiltered')
          : t('adminCategories.emptyDescDefault')
        ">
      <template #action>
        <a-button v-if="searchText" type="primary" @click="searchText = ''">{{ t('adminCategories.clearSearch')
          }}</a-button>
        <a-button v-else type="primary" @click="openCreateModal">{{ t('adminCategories.addCategory') }}</a-button>
      </template>
    </AdminEmptyState>
    <AdminDataTable v-else :columns="columns" :data-source="paginatedCategories" row-key="id"
      :row-selection="rowSelection">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'name'">
          <div class="entity-cell">
            <a-avatar shape="square" :size="40">{{ record.name.charAt(0).toUpperCase() }}</a-avatar>
            <div>
              <strong>{{ record.name }}</strong><span>#{{ record.id }}</span>
            </div>
          </div>
        </template>
        <template v-else-if="column.key === 'action'">
          <AdminActionMenu :items="[{ key: 'delete', label: t('adminCategories.deleteCategory'), danger: true }]"
            :label="t('adminCategories.rowActionsLabel')" @select="handleRowAction(record, $event)" />
        </template>
      </template>
      <template #pagination>
        <AdminPagination :current="currentPage" :page-size="pageSize" :total="filteredCategories.length"
          @change="handlePageChange" @size-change="handlePageSizeChange" />
      </template>
    </AdminDataTable>

    <AdminModal :open="createModalVisible" :title="t('adminCategories.createModalTitle')"
      :ok-text="t('adminCategories.createModalOk')" :loading="creating" @update:open="createModalVisible = $event"
      @confirm="handleCreateCategory" @cancel="closeCreateModal">
      <a-form layout="vertical">
        <a-form-item :label="t('adminCategories.imageLabel')">
          <a-upload accept="image/*" :custom-request="uploadImage" :show-upload-list="false">
            <a-button :icon="h(UploadOutlined)">{{ t('adminCategories.chooseImage') }}</a-button>
          </a-upload>
          <a-image v-if="imagePreview" class="preview" width="80" :src="imagePreview"
            :alt="t('adminCategories.imageAlt')" />
          <p v-else class="field-help">{{ t('adminCategories.imageHelp') }}</p>
        </a-form-item>
        <a-form-item :label="t('adminCategories.nameLabel')" name="name" required>
          <a-input v-model:value="createForm.name" :placeholder="t('adminCategories.namePlaceholder')" />
        </a-form-item>
        <a-form-item :label="t('adminCategories.slugLabel')" name="slug" required>
          <a-input v-model:value="createForm.slug" :placeholder="t('adminCategories.slugPlaceholder')" />
        </a-form-item>
      </a-form>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
import { CategoryService } from '@/api/services/category'
import type { IGetCategoryResponse } from '@/api/models/category'
import {
  AdminActionMenu,
  AdminDataTable,
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminModal,
  AdminPagination,
  AdminSearch,
  AdminTableToolbar,
} from '@/components/Admin'
import { message, Modal } from 'ant-design-vue'
import { computed, h, onMounted, reactive, ref, watch } from 'vue'
import { DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const categories = ref<IGetCategoryResponse[]>([])
const selectedRowKeys = ref<number[]>([])
const createModalVisible = ref(false)
const imagePreview = ref<string | null>(null)
const selectedImageFile = ref<File | null>(null)
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(true)
const loadError = ref(false)
const creating = ref(false)
const createForm = reactive({ name: '', slug: '' })

const columns = computed(() => [
  {
    title: t('adminCategories.columnCategory'),
    dataIndex: 'name',
    key: 'name',
    width: 320,
    sorter: (a: IGetCategoryResponse, b: IGetCategoryResponse) => a.name.localeCompare(b.name),
  },
  { title: t('adminCategories.columnSlug'), dataIndex: 'slug', key: 'slug', width: 320 },
  { title: t('adminCategories.columnAction'), key: 'action', width: 96, fixed: 'right' },
])

const filteredCategories = computed(() => {
  const keyword = searchText.value.trim().toLocaleLowerCase('vi-VN')
  return !keyword
    ? categories.value
    : categories.value.filter((category) =>
      [category.name, category.slug, String(category.id)].some((value) =>
        value.toLocaleLowerCase('vi-VN').includes(keyword),
      ),
    )
})
const paginatedCategories = computed(() =>
  filteredCategories.value.slice(
    (currentPage.value - 1) * pageSize.value,
    currentPage.value * pageSize.value,
  ),
)
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: number[]) => {
    selectedRowKeys.value = keys
  },
}))

const loadCategories = async () => {
  loading.value = true
  loadError.value = false
  try {
    categories.value = await CategoryService.getAllCategories()
  } catch (error) {
    console.error(error)
    loadError.value = true
    message.error(t('adminCategories.loadListError'))
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  createModalVisible.value = true
}
const closeCreateModal = () => {
  createModalVisible.value = false
  createForm.name = ''
  createForm.slug = ''
  imagePreview.value = null
  selectedImageFile.value = null
}
const handleCreateCategory = async () => {
  if (!createForm.name.trim() || !createForm.slug.trim()) {
    message.warning(t('adminCategories.fillNameSlugWarning'))
    return
  }
  creating.value = true
  try {
    await CategoryService.createCategory(createForm.name.trim(), createForm.slug.trim())
    message.success(t('adminCategories.createSuccess'))
    closeCreateModal()
    await loadCategories()
  } catch (error) {
    console.error(error)
    message.error(t('adminCategories.createFailed'))
  } finally {
    creating.value = false
  }
}
const deleteCategories = async (ids: number[]) => {
  try {
    await Promise.all(ids.map((id) => CategoryService.deleteCategory(id)))
    message.success(t('adminCategories.deleteSuccess'))
    selectedRowKeys.value = []
    await loadCategories()
  } catch (error) {
    console.error(error)
    message.error(t('adminCategories.deleteFailed'))
  }
}
const confirmDelete = (ids: number[]) =>
  Modal.confirm({
    title: t('adminCategories.confirmDeleteTitle'),
    content: t('adminCategories.confirmDeleteContent', { count: ids.length }),
    okText: t('adminCategories.confirmDeleteOk'),
    okButtonProps: { danger: true },
    cancelText: t('adminCategories.cancel'),
    onOk: () => deleteCategories(ids),
  })
const confirmDeleteSelected = () => confirmDelete(selectedRowKeys.value)
const handleRowAction = (category: IGetCategoryResponse, action: string) => {
  if (action === 'delete') confirmDelete([category.id])
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
const handlePageChange = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
}
const handlePageSizeChange = (_current: number, size: number) => {
  pageSize.value = size
  resetPage()
}

watch([searchText, pageSize], resetPage)
onMounted(loadCategories)
</script>

<style scoped>
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

.selection-bar>div {
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
.field-help {
  margin: var(--space-sm) 0 0;
  color: var(--color-muted-foreground);
  font-size: 0.8125rem;
}

.preview {
  display: block;
  margin-top: var(--space-md);
}

@media (max-width: 640px) {

  .selection-bar,
  .selection-bar>div {
    align-items: stretch;
    flex-direction: column;
  }

  .selection-bar :deep(.ant-btn) {
    width: 100%;
  }
}
</style>
