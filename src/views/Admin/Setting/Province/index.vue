<template>
  <div class="location-settings">
    <header class="location-intro">
      <div>
        <p>Thiết lập giao hàng</p>
        <h1>Tỉnh thành và phường xã</h1>
        <span>Quản lý dữ liệu địa chỉ phục vụ đơn hàng và vận chuyển.</span>
      </div>
      <a-button :loading="provinceLoading" @click="loadProvinces">Tải lại dữ liệu</a-button>
    </header>

    <a-tabs v-model:active-key="activeTab" class="location-tabs">
      <a-tab-pane key="provinces" tab="Tỉnh / Thành phố">
        <AdminTableToolbar>
          <template #search
            ><AdminSearch
              v-model="searchText"
              label="Tìm tỉnh thành"
              placeholder="Tìm tên, mã hoặc slug tỉnh thành..."
              @search="resetProvincePage"
          /></template>
        </AdminTableToolbar>
        <AdminLoadingState v-if="provinceLoading" label="Đang tải tỉnh thành..." />
        <AdminErrorState
          v-else-if="provinceError"
          title="Không thể tải tỉnh thành"
          description="Vui lòng kiểm tra kết nối và thử lại."
          @retry="loadProvinces"
          ><template #action>Thử tải lại</template></AdminErrorState
        >
        <AdminEmptyState
          v-else-if="!filteredProvinces.length"
          :title="searchText ? 'Không tìm thấy tỉnh thành' : 'Chưa có dữ liệu tỉnh thành'"
          :description="
            searchText
              ? 'Thử thay đổi từ khóa tìm kiếm.'
              : 'Dữ liệu tỉnh thành sẽ xuất hiện tại đây.'
          "
          ><template #action
            ><a-button v-if="searchText" type="primary" @click="searchText = ''"
              >Xóa tìm kiếm</a-button
            ></template
          ></AdminEmptyState
        >
        <AdminDataTable
          v-else
          :columns="provinceColumns"
          :data-source="paginatedProvinces"
          row-key="provinceCode"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'"
              ><a-button type="link" @click="openWardTab(record.provinceCode)"
                >Xem phường xã</a-button
              ></template
            >
          </template>
          <template #pagination
            ><AdminPagination
              :current="provincePage"
              :page-size="pageSize"
              :total="filteredProvinces.length"
              @change="handleProvincePageChange"
              @size-change="handleProvincePageSizeChange"
          /></template>
        </AdminDataTable>
      </a-tab-pane>

      <a-tab-pane key="wards" tab="Phường / Xã">
        <AdminTableToolbar>
          <template #filters>
            <a-select
              v-model:value="selectedProvinceCode"
              aria-label="Chọn tỉnh thành"
              class="province-select"
              placeholder="Chọn tỉnh/thành phố"
              allow-clear
              :options="provinceOptions"
              @change="onProvinceChange"
            />
          </template>
          <template #actions
            ><a-button
              type="primary"
              :disabled="!selectedProvinceCode"
              :loading="wardLoading"
              @click="loadWards(selectedProvinceCode)"
              >Tải phường xã</a-button
            ></template
          >
        </AdminTableToolbar>
        <AdminLoadingState v-if="wardLoading" label="Đang tải phường xã..." />
        <AdminErrorState
          v-else-if="wardError"
          title="Không thể tải phường xã"
          description="Vui lòng kiểm tra kết nối và thử lại."
          @retry="loadWards(selectedProvinceCode)"
          ><template #action>Thử tải lại</template></AdminErrorState
        >
        <AdminEmptyState
          v-else-if="!wards.length"
          :title="selectedProvinceCode ? 'Chưa có phường xã' : 'Chọn tỉnh thành để xem phường xã'"
          :description="
            selectedProvinceCode
              ? 'Tỉnh thành này chưa có dữ liệu phường xã.'
              : 'Dùng bộ chọn phía trên để tải danh sách phường xã.'
          "
        >
          <template #action
            ><a-button v-if="selectedProvinceCode" @click="loadWards(selectedProvinceCode)"
              >Tải lại</a-button
            ></template
          >
        </AdminEmptyState>
        <AdminDataTable
          v-else
          :columns="wardColumns"
          :data-source="paginatedWards"
          row-key="wardCode"
        >
          <template #pagination
            ><AdminPagination
              :current="wardPage"
              :page-size="pageSize"
              :total="wards.length"
              @change="handleWardPageChange"
              @size-change="handleWardPageSizeChange"
          /></template>
        </AdminDataTable>
      </a-tab-pane>

      <a-tab-pane key="import" tab="Import dữ liệu">
        <AdminFormSection
          title="Import phường xã bằng JSON"
          description="Chọn tỉnh thành và dán một mảng JSON hợp lệ để gửi đến API import ward."
        >
          <a-form layout="vertical">
            <a-form-item label="Tỉnh / Thành phố" required
              ><a-select
                v-model:value="selectedProvinceCodeForImport"
                placeholder="Chọn tỉnh để import phường xã"
                :options="provinceOptions"
                allow-clear
            /></a-form-item>
            <a-form-item label="Dữ liệu JSON" required
              ><a-textarea
                v-model:value="wardJsonInput"
                :rows="12"
                placeholder='[&#10;  {&#10;    "name": "Phường 1",&#10;    "locationSlug": "phuong-1",&#10;    "wardCode": "26734",&#10;    "legacyAddress": ""&#10;  }&#10;]'
            /></a-form-item>
            <a-button
              type="primary"
              :disabled="!selectedProvinceCodeForImport"
              :loading="importingWards"
              @click="submitWardJsonImport"
              >Import phường xã</a-button
            >
          </a-form>
        </AdminFormSection>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  AdminDataTable,
  AdminEmptyState,
  AdminErrorState,
  AdminFormSection,
  AdminLoadingState,
  AdminPagination,
  AdminSearch,
  AdminTableToolbar,
} from '@/components/Admin'
import { ProvinceService } from '@/api/services/province'
import type { IGetProvinceResponse, IGetWardResponse } from '@/api/models/province'

const provinces = ref<IGetProvinceResponse[]>([])
const wards = ref<IGetWardResponse[]>([])
const provinceLoading = ref(true)
const wardLoading = ref(false)
const importingWards = ref(false)
const provinceError = ref(false)
const wardError = ref(false)
const searchText = ref('')
const activeTab = ref('provinces')
const selectedProvinceCode = ref<string>()
const selectedProvinceCodeForImport = ref<string>()
const wardJsonInput = ref('')
const provincePage = ref(1)
const wardPage = ref(1)
const pageSize = ref(10)

const provinceOptions = computed(() =>
  provinces.value.map((province) => ({
    label: `${province.name} (${province.provinceCode})`,
    value: province.provinceCode,
  })),
)
const filteredProvinces = computed(() => {
  const keyword = searchText.value.trim().toLocaleLowerCase('vi-VN')
  return !keyword
    ? provinces.value
    : provinces.value.filter((item) =>
        [item.name, item.provinceCode, item.locationSlug].some((value) =>
          value.toLocaleLowerCase('vi-VN').includes(keyword),
        ),
      )
})
const paginatedProvinces = computed(() =>
  filteredProvinces.value.slice(
    (provincePage.value - 1) * pageSize.value,
    provincePage.value * pageSize.value,
  ),
)
const paginatedWards = computed(() =>
  wards.value.slice((wardPage.value - 1) * pageSize.value, wardPage.value * pageSize.value),
)
const provinceColumns = [
  {
    title: 'Tỉnh / Thành phố',
    dataIndex: 'name',
    key: 'name',
    width: 280,
    sorter: (a: IGetProvinceResponse, b: IGetProvinceResponse) => a.name.localeCompare(b.name),
  },
  { title: 'Mã tỉnh', dataIndex: 'provinceCode', key: 'provinceCode', width: 140 },
  { title: 'Slug', dataIndex: 'locationSlug', key: 'locationSlug', width: 220 },
  {
    title: 'Địa chỉ cũ',
    dataIndex: 'legacyAddress',
    key: 'legacyAddress',
    width: 260,
    ellipsis: true,
  },
  { title: 'Thao tác', key: 'action', width: 150, fixed: 'right' },
]
const wardColumns = [
  { title: 'Phường / Xã', dataIndex: 'name', key: 'name', width: 280 },
  { title: 'Mã phường', dataIndex: 'wardCode', key: 'wardCode', width: 160 },
  { title: 'Slug', dataIndex: 'locationSlug', key: 'locationSlug', width: 240 },
  {
    title: 'Địa chỉ cũ',
    dataIndex: 'legacyAddress',
    key: 'legacyAddress',
    width: 280,
    ellipsis: true,
  },
]

const loadProvinces = async () => {
  provinceLoading.value = true
  provinceError.value = false
  try {
    provinces.value = await ProvinceService.getProvinces()
  } catch (error) {
    console.error(error)
    provinceError.value = true
    message.error('Không thể tải danh sách tỉnh/thành phố')
  } finally {
    provinceLoading.value = false
  }
}
const loadWards = async (provinceCode?: string) => {
  if (!provinceCode) {
    wards.value = []
    return
  }
  wardLoading.value = true
  wardError.value = false
  try {
    wards.value = await ProvinceService.getWardsByProvince(provinceCode)
  } catch (error) {
    console.error(error)
    wardError.value = true
    message.error('Không thể tải danh sách phường/xã')
  } finally {
    wardLoading.value = false
  }
}
const openWardTab = (provinceCode: string) => {
  selectedProvinceCode.value = provinceCode
  activeTab.value = 'wards'
  loadWards(provinceCode)
}
const onProvinceChange = (value?: string) => {
  selectedProvinceCode.value = value
  wardPage.value = 1
  loadWards(value)
}
const submitWardJsonImport = async () => {
  if (!selectedProvinceCodeForImport.value) {
    message.warning('Vui lòng chọn tỉnh trước khi import ward')
    return
  }
  if (!wardJsonInput.value.trim()) {
    message.warning('Vui lòng nhập nội dung JSON')
    return
  }
  importingWards.value = true
  try {
    const parsed = JSON.parse(wardJsonInput.value)
    if (!Array.isArray(parsed)) throw new Error('Payload phải là mảng JSON')
    await ProvinceService.importWardsByProvince(selectedProvinceCodeForImport.value, parsed)
    message.success('Import ward thành công')
    await loadWards(selectedProvinceCodeForImport.value)
    wardJsonInput.value = ''
  } catch (error) {
    console.error(error)
    message.error('Import ward thất bại, vui lòng kiểm tra định dạng JSON')
  } finally {
    importingWards.value = false
  }
}
const resetProvincePage = () => {
  provincePage.value = 1
}
const handleProvincePageChange = (page: number, size: number) => {
  provincePage.value = page
  pageSize.value = size
}
const handleProvincePageSizeChange = (_current: number, size: number) => {
  pageSize.value = size
  resetProvincePage()
}
const handleWardPageChange = (page: number, size: number) => {
  wardPage.value = page
  pageSize.value = size
}
const handleWardPageSizeChange = (_current: number, size: number) => {
  pageSize.value = size
  wardPage.value = 1
}

watch([searchText, pageSize], resetProvincePage)
onMounted(loadProvinces)
</script>

<style scoped>
.location-settings {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}
.location-intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-lg);
}
.location-intro p {
  margin: 0 0 var(--space-xs);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.location-intro h1 {
  margin: 0;
  font-size: clamp(1.5rem, 2vw, 2rem);
}
.location-intro span {
  display: block;
  margin-top: var(--space-sm);
  color: var(--color-muted-foreground);
}
.location-tabs :deep(.ant-tabs-nav) {
  margin-bottom: var(--space-lg);
}
.province-select {
  width: min(100%, 360px);
}
@media (max-width: 640px) {
  .location-intro {
    flex-direction: column;
  }
  .location-intro > .ant-btn {
    width: 100%;
  }
  .province-select {
    width: 100%;
  }
}
</style>
