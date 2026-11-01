<template>
    <main class="stores-page">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="mb-6">
                <h1 class="page-title">{{ t('storesPage.pageTitle') }}</h1>
                <p class="page-description">{{ t('storesPage.pageDescription') }}</p>
            </div>

            <div class="filters">
                <a-select v-model:value="provinceFilter" class="province-filter" :options="provinceFilterOptions"
                    show-search :filter-option="filterOption" :aria-label="t('storesPage.allProvinces')" />
                <a-input v-model:value="searchText" allow-clear :placeholder="t('storesPage.searchPlaceholder')"
                    class="search-input" />
            </div>

            <div v-if="loadFailed" class="state-box">
                <p>{{ t('storesPage.loadError') }}</p>
                <a-button type="primary" @click="loadStores">{{ t('storesPage.retry') }}</a-button>
            </div>

            <div v-else class="stores-layout">
                <section class="store-list" :aria-label="t('storesPage.pageTitle')">
                    <p class="store-count">{{ t('storesPage.count', { count: filteredStores.length }) }}</p>
                    <a-spin :spinning="loading">
                        <p v-if="!loading && filteredStores.length === 0" class="state-box">{{ t('storesPage.empty') }}
                        </p>
                        <button v-for="store in filteredStores" :key="store.id" type="button" class="store-card"
                            :class="{ 'store-card--active': store.id === selectedId }" @click="selectedId = store.id">
                            <strong class="store-name">{{ store.name }}</strong>
                            <span class="store-line"><i class="pi pi-map-marker"></i>{{ store.address }}</span>
                            <span class="store-province">{{ provinceName(store.provinceCode) }}</span>
                            <span class="store-actions">
                                <a v-if="store.phone" :href="`tel:${store.phone}`" class="store-link" @click.stop>
                                    <i class="pi pi-phone"></i>{{ store.phone }}
                                </a>
                                <a :href="osmLink(store)" target="_blank" rel="noopener noreferrer" class="store-link"
                                    @click.stop>
                                    <i class="pi pi-external-link"></i>{{ t('storesPage.directions') }}
                                </a>
                            </span>
                        </button>
                    </a-spin>
                </section>

                <div class="store-map">
                    <MapPicker :model-value="selectedPoint" :store-markers="markers" readonly height="560px"
                        @select-store="onSelectStore" />
                </div>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MapPicker from '@/components/common/MapPicker/index.vue'
import { StoreService } from '@/api/services/store'
import { ProvinceService } from '@/api/services/province'
import type { IMapPoint, IMapStoreMarker, IStore } from '@/api/models/store'
import type { IGetProvinceResponse } from '@/api/models/province'

const { t } = useI18n()
const stores = ref<IStore[]>([])
const provinces = ref<IGetProvinceResponse[]>([])
const loading = ref(false)
const loadFailed = ref(false)
const provinceFilter = ref('all')
const searchText = ref('')
const selectedId = ref<number | null>(null)

const provinceName = (code: string | null) =>
    provinces.value.find((p) => p.provinceCode === code)?.name ?? ''

// Chỉ liệt kê các tỉnh đang có cửa hàng
const provinceFilterOptions = computed(() => {
    const codes = new Set(stores.value.map((s) => s.provinceCode).filter((c): c is string => !!c))
    return [
        { label: t('storesPage.allProvinces'), value: 'all' },
        ...provinces.value.filter((p) => codes.has(p.provinceCode)).map((p) => ({ label: p.name, value: p.provinceCode })),
    ]
})
const filterOption = (input: string, option?: { label?: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())

const filteredStores = computed(() => {
    const keyword = searchText.value.trim().toLowerCase()
    return stores.value.filter(
        (s) =>
            (provinceFilter.value === 'all' || s.provinceCode === provinceFilter.value) &&
            (!keyword || `${s.name} ${s.address}`.toLowerCase().includes(keyword)),
    )
})

const markers = computed<IMapStoreMarker[]>(() =>
    filteredStores.value.map((s) => ({ id: s.id, label: s.name, lat: s.latitude, lng: s.longitude })),
)
const selectedPoint = computed<IMapPoint | null>(() => {
    const store = filteredStores.value.find((s) => s.id === selectedId.value)
    return store ? { lat: store.latitude, lng: store.longitude } : null
})

const onSelectStore = (id: number | string) => {
    selectedId.value = Number(id)
}
const osmLink = (s: IStore) =>
    `https://www.openstreetmap.org/?mlat=${s.latitude}&mlon=${s.longitude}#map=17/${s.latitude}/${s.longitude}`

const loadStores = async () => {
    loading.value = true
    loadFailed.value = false
    try {
        stores.value = await StoreService.getStores()
    } catch {
        loadFailed.value = true
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    provinces.value = await ProvinceService.getProvinces().catch(() => [])
    await loadStores()
})
</script>

<style scoped>
.stores-page {
    min-height: calc(100vh - 120px);
}

.page-title {
    font-size: 2rem;
    font-weight: 800;
    color: var(--color-card-foreground);
    margin-bottom: 0.5rem;
}

.page-description {
    color: var(--color-text-subtle);
    font-size: 1rem;
}

.filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
}

.province-filter {
    width: min(100%, 280px);
}

.search-input {
    width: min(100%, 360px);
}

.stores-layout {
    display: grid;
    grid-template-columns: minmax(280px, 380px) minmax(0, 1fr);
    gap: 20px;
    align-items: start;
}

.store-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 560px;
    overflow-y: auto;
    padding-right: 4px;
}

.store-count {
    color: var(--color-muted-foreground);
    font-size: 13px;
    margin: 0;
}

.store-card {
    display: grid;
    gap: 6px;
    width: 100%;
    margin-bottom: 12px;
    padding: 14px;
    text-align: left;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.store-card:hover,
.store-card--active {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
}

.store-card:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--color-ring) 35%, transparent);
    outline-offset: 2px;
}

.store-name {
    color: var(--color-foreground);
    font-size: 16px;
}

.store-line {
    display: flex;
    gap: 8px;
    color: var(--color-foreground);
    font-size: 14px;
}

.store-province {
    color: var(--color-muted-foreground);
    font-size: 13px;
}

.store-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.store-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--color-primary);
    font-size: 13px;
    font-weight: 600;
}

.store-map {
    position: sticky;
    top: 20px;
}

.state-box {
    display: grid;
    justify-items: center;
    gap: 12px;
    padding: 32px 0;
    color: var(--color-muted-foreground);
}

@media (max-width: 900px) {
    .stores-layout {
        grid-template-columns: 1fr;
    }

    .store-list {
        max-height: none;
    }

    .store-map {
        position: static;
        order: -1;
    }
}
</style>
