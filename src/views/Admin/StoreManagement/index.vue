<template>
  <div class="entity-management">
    <div class="toolbar">
      <a-select v-model:value="provinceFilter" class="province-filter" :options="provinceFilterOptions"
        :aria-label="t('adminStores.filterProvince')" show-search :filter-option="filterOption" />
      <a-button type="primary" :icon="h(PlusOutlined)" @click="openCreate">{{ t('adminStores.addStore') }}</a-button>
    </div>

    <a-table :columns="columns" :data-source="filteredStores" row-key="id" :loading="loading"
      :pagination="{ pageSize: 10, hideOnSinglePage: true }" :scroll="{ x: 'max-content' }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'province'">{{ provinceName(record.provinceCode) }}</template>
        <template v-else-if="column.key === 'coordinates'">
          {{ record.latitude.toFixed(5) }}, {{ record.longitude.toFixed(5) }}
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.isActive ? 'green' : 'default'">
            {{ record.isActive ? t('adminStores.active') : t('adminStores.inactive') }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button size="small" @click="openEdit(record)">{{ t('adminStores.editStore') }}</a-button>
            <a-button size="small" @click="openInventory(record)">{{ t('adminStores.inventory') }}</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <AdminModal :open="storeModalOpen" :title="editingId ? t('adminStores.editStore') : t('adminStores.addStore')"
      :loading="saving" @update:open="storeModalOpen = $event" @confirm="saveStore" @cancel="storeModalOpen = false">
      <a-form layout="vertical">
        <a-form-item :label="t('adminStores.name')" required>
          <a-input v-model:value="form.name" />
        </a-form-item>
        <a-form-item :label="t('adminStores.province')">
          <a-select v-model:value="form.provinceCode" :options="provinceOptions" allow-clear show-search
            :filter-option="filterOption" />
        </a-form-item>
        <a-form-item :label="t('adminStores.address')" required>
          <a-input v-model:value="form.address" />
        </a-form-item>
        <a-form-item :label="t('adminStores.phone')">
          <a-input v-model:value="form.phone" />
        </a-form-item>
        <a-form-item :label="t('adminStores.coordinates')" required>
          <a-auto-complete v-model:value="searchText" :options="searchOptions" :filter-option="false"
            :placeholder="t('adminStores.pickOnMap')" class="w-full" allow-clear @search="onSearch"
            @select="onSelectPlace" />
          <div class="map-wrap">
            <MapPicker v-model="point" height="260px" />
          </div>
          <p v-if="point" class="coordinates">{{ point.lat.toFixed(5) }}, {{ point.lng.toFixed(5) }}</p>
        </a-form-item>
        <a-form-item :label="t('adminStores.status')">
          <a-switch v-model:checked="form.isActive" />
          <span class="switch-label">{{ t('adminStores.active') }}</span>
        </a-form-item>
      </a-form>
    </AdminModal>

    <AdminModal :open="inventoryModalOpen"
      :title="t('adminStores.inventoryTitle', { store: inventoryStore?.name ?? '' })"
      @update:open="inventoryModalOpen = $event" @cancel="inventoryModalOpen = false">
      <a-input v-model:value="inventorySearch" allow-clear class="inventory-search"
        :placeholder="t('adminStores.searchProduct')" />
      <a-table :columns="inventoryColumns" :data-source="filteredInventoryRows" row-key="productId" size="small"
        :loading="inventoryLoading" :pagination="{ pageSize: 8, hideOnSinglePage: true }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'amount'">
            <a-input-number v-model:value="draft[record.productId]" :min="0" :precision="0" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button size="small" type="primary" :disabled="draft[record.productId] === record.amount"
              :loading="savingProductId === record.productId" @click="saveInventory(record)">
              {{ t('adminCommon.save') }}
            </a-button>
          </template>
        </template>
      </a-table>
      <template #footer>
        <a-button @click="inventoryModalOpen = false">{{ t('adminCommon.cancel') }}</a-button>
      </template>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue'
import { debounce } from 'lodash'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import { AdminModal } from '@/components/Admin'
import MapPicker from '@/components/common/MapPicker/index.vue'
import { GeoService, StoreService } from '@/api/services/store'
import { ProvinceService } from '@/api/services/province'
import { ProductService } from '@/api/services/product'
import type { IGeoPlace, IMapPoint, IStore } from '@/api/models/store'
import type { IGetProvinceResponse } from '@/api/models/province'

interface InventoryRow {
  productId: number
  productName: string
  amount: number
}

const { t } = useI18n()
const stores = ref<IStore[]>([])
const provinces = ref<IGetProvinceResponse[]>([])
const loading = ref(false)
const provinceFilter = ref('all')

const provinceOptions = computed(() => provinces.value.map((p) => ({ label: p.name, value: p.provinceCode })))
const provinceFilterOptions = computed(() => [
  { label: t('adminStores.allProvinces'), value: 'all' },
  ...provinceOptions.value,
])
const filterOption = (input: string, option?: { label?: string }) =>
  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
const provinceName = (code: string | null) =>
  provinces.value.find((p) => p.provinceCode === code)?.name ?? '-'

const filteredStores = computed(() =>
  provinceFilter.value === 'all'
    ? stores.value
    : stores.value.filter((s) => s.provinceCode === provinceFilter.value),
)

const columns = computed(() => [
  { title: t('adminStores.name'), dataIndex: 'name', key: 'name' },
  { title: t('adminStores.province'), key: 'province' },
  { title: t('adminStores.address'), dataIndex: 'address', key: 'address' },
  { title: t('adminStores.coordinates'), key: 'coordinates' },
  { title: t('adminStores.status'), key: 'status' },
  { title: t('adminStores.actions'), key: 'action', fixed: 'right' as const },
])

const loadStores = async () => {
  loading.value = true
  try {
    stores.value = await StoreService.getStores({ includeInactive: true })
  } catch {
    message.error(t('adminStores.loadError'))
  } finally {
    loading.value = false
  }
}

// ---- Store form ----
const storeModalOpen = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  name: '',
  provinceCode: undefined as string | undefined,
  address: '',
  phone: '',
  latitude: null as number | null,
  longitude: null as number | null,
  isActive: true,
})
const searchText = ref('')
const searchResults = ref<IGeoPlace[]>([])
const searchOptions = computed(() => searchResults.value.map((p) => ({ value: p.displayName, label: p.displayName })))

const point = computed<IMapPoint | null>({
  get: () => (form.latitude !== null && form.longitude !== null ? { lat: form.latitude, lng: form.longitude } : null),
  set: (value) => {
    if (!value) return
    form.latitude = value.lat
    form.longitude = value.lng
  },
})

const runSearch = debounce(async (query: string) => {
  if (query.trim().length < 3) {
    searchResults.value = []
    return
  }
  try {
    searchResults.value = await GeoService.search(query)
  } catch {
    searchResults.value = []
  }
}, 700)
const onSearch = (query: string) => runSearch(query)
const onSelectPlace = (value: string) => {
  const place = searchResults.value.find((p) => p.displayName === value)
  if (!place) return
  form.latitude = place.latitude
  form.longitude = place.longitude
  if (!form.address.trim()) form.address = place.displayName
}

const resetForm = () => {
  form.name = ''
  form.provinceCode = undefined
  form.address = ''
  form.phone = ''
  form.latitude = null
  form.longitude = null
  form.isActive = true
  searchText.value = ''
  searchResults.value = []
}
const openCreate = () => {
  editingId.value = null
  resetForm()
  storeModalOpen.value = true
}
const openEdit = (store: IStore) => {
  editingId.value = store.id
  resetForm()
  form.name = store.name
  form.provinceCode = store.provinceCode ?? undefined
  form.address = store.address
  form.phone = store.phone ?? ''
  form.latitude = store.latitude
  form.longitude = store.longitude
  form.isActive = store.isActive
  storeModalOpen.value = true
}

const saveStore = async () => {
  if (!form.name.trim()) return message.warning(t('adminStores.nameRequired'))
  if (!form.address.trim()) return message.warning(t('adminStores.addressRequired'))
  if (form.latitude === null || form.longitude === null) return message.warning(t('adminStores.locationRequired'))

  const payload = {
    name: form.name.trim(),
    provinceCode: form.provinceCode ?? null,
    address: form.address.trim(),
    phone: form.phone.trim() || null,
    latitude: form.latitude,
    longitude: form.longitude,
    isActive: form.isActive,
  }
  saving.value = true
  try {
    if (editingId.value) {
      await StoreService.updateStore(editingId.value, payload)
    } else {
      await StoreService.createStore(payload)
    }
    message.success(t('adminStores.saved'))
    storeModalOpen.value = false
    await loadStores()
  } catch {
    message.error(t('adminStores.saveError'))
  } finally {
    saving.value = false
  }
}

// ---- Inventory ----
const inventoryModalOpen = ref(false)
const inventoryLoading = ref(false)
const inventoryStore = ref<IStore | null>(null)
const inventoryRows = ref<InventoryRow[]>([])
const draft = reactive<Record<number, number>>({})
const inventorySearch = ref('')
const savingProductId = ref<number | null>(null)

const inventoryColumns = computed(() => [
  { title: t('adminStores.product'), dataIndex: 'productName', key: 'productName' },
  { title: t('adminStores.amount'), key: 'amount', width: 140 },
  { title: '', key: 'action', width: 90 },
])
const filteredInventoryRows = computed(() => {
  const keyword = inventorySearch.value.trim().toLowerCase()
  return keyword
    ? inventoryRows.value.filter((r) => r.productName.toLowerCase().includes(keyword))
    : inventoryRows.value
})

const openInventory = async (store: IStore) => {
  inventoryStore.value = store
  inventorySearch.value = ''
  inventoryModalOpen.value = true
  inventoryLoading.value = true
  try {
    const [products, inventory] = await Promise.all([
      ProductService.getAllProducts(),
      StoreService.getInventory(store.id),
    ])
    const amounts = new Map(inventory.map((i) => [i.productId, i.amount]))
    inventoryRows.value = products
      .map((p) => ({ productId: p.id, productName: p.name, amount: amounts.get(p.id) ?? 0 }))
      .sort((a, b) => a.productName.localeCompare(b.productName))
    Object.keys(draft).forEach((k) => delete draft[Number(k)])
    inventoryRows.value.forEach((r) => (draft[r.productId] = r.amount))
  } catch {
    message.error(t('adminStores.inventoryLoadError'))
  } finally {
    inventoryLoading.value = false
  }
}

const saveInventory = async (row: InventoryRow) => {
  if (!inventoryStore.value) return
  savingProductId.value = row.productId
  try {
    const saved = await StoreService.setInventory(inventoryStore.value.id, row.productId, draft[row.productId] ?? 0)
    row.amount = saved.amount
    draft[row.productId] = saved.amount
    message.success(t('adminStores.inventorySaved'))
  } catch {
    message.error(t('adminStores.inventoryError'))
  } finally {
    savingProductId.value = null
  }
}

onMounted(async () => {
  provinces.value = await ProvinceService.getProvinces().catch(() => [])
  await loadStores()
})
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.province-filter {
  width: min(100%, 260px);
}

.map-wrap {
  margin-top: var(--space-sm);
}

.coordinates {
  margin: var(--space-sm) 0 0;
  color: var(--color-muted-foreground);
  font-size: 12px;
}

.switch-label {
  margin-left: var(--space-sm);
}

.inventory-search {
  margin-bottom: var(--space-md);
}
</style>
