<template>
    <div class="province-ward-page">
        <a-card>
            <div class="page-header">
                <div>
                    <h2>Quản lý tỉnh/thành phố & phường/xã</h2>
                    <p>Danh sách province và ward được lấy từ API hiện có.</p>
                </div>
                <a-button type="primary" @click="loadProvinces">Tải lại</a-button>
            </div>

            <a-card class="import-card" size="small">
                <div class="import-header">
                    <div>
                        <h3>Import ward bằng JSON</h3>
                        <p>Chọn tỉnh và dán mảng JSON để gửi vào API import ward.</p>
                    </div>
                </div>

                <div class="import-controls">
                    <a-select v-model:value="selectedProvinceCodeForImport" placeholder="Chọn tỉnh để import ward"
                        style="width: 320px" allow-clear>
                        <a-select-option v-for="item in provinces" :key="item.provinceCode" :value="item.provinceCode">
                            {{ item.name }} ({{ item.provinceCode }})
                        </a-select-option>
                    </a-select>
                    <a-button type="primary" :disabled="!selectedProvinceCodeForImport || importingWards"
                        @click="submitWardJsonImport">
                        Import ward
                    </a-button>
                </div>

                <a-textarea v-model:value="wardJsonInput" :rows="12"
                    placeholder="[&#10;  {&#10;    &quot;name&quot;: &quot;Phường 1&quot;,&#10;    &quot;locationSlug&quot;: &quot;phuong-1&quot;,&#10;    &quot;wardCode&quot;: &quot;26734&quot;,&#10;    &quot;legacyAddress&quot;: &quot;&quot;&#10;  }&#10;]" />
            </a-card>

            <a-tabs v-model:activeKey="activeTab">
                <a-tab-pane key="provinces" tab="Tỉnh / Thành phố">
                    <div class="toolbar">
                        <a-input-search v-model:value="searchText" placeholder="Tìm tỉnh/thành phố..." enter-button
                            allow-clear @search="loadProvinces" />
                    </div>

                    <a-table :columns="provinceColumns" :data-source="filteredProvinces" :loading="loading"
                        row-key="provinceCode" :pagination="{ pageSize: 10 }">
                        <template #bodyCell="{ column, record }">
                            <template v-if="column.key === 'action'">
                                <a-button type="link" @click="openWardTab(record.provinceCode)">Xem phường</a-button>
                            </template>
                        </template>
                    </a-table>
                </a-tab-pane>

                <a-tab-pane key="wards" tab="Phường / Xã">
                    <div class="toolbar">
                        <a-select v-model:value="selectedProvinceCode" placeholder="Chọn tỉnh/thành phố"
                            style="width: 320px" allow-clear @change="onProvinceChange">
                            <a-select-option v-for="item in provinces" :key="item.provinceCode"
                                :value="item.provinceCode">
                                {{ item.name }} ({{ item.provinceCode }})
                            </a-select-option>
                        </a-select>
                        <a-button type="primary" :disabled="!selectedProvinceCode"
                            @click="loadWards(selectedProvinceCode)">
                            Tải phường
                        </a-button>
                    </div>

                    <a-table :columns="wardColumns" :data-source="wards" :loading="wardLoading" row-key="wardCode"
                        :pagination="{ pageSize: 10 }" />
                </a-tab-pane>
            </a-tabs>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { ProvinceService } from '@/api/services/province'
import type { IGetProvinceResponse, IGetWardResponse } from '@/api/models/province'

const provinces = ref<IGetProvinceResponse[]>([])
const wards = ref<IGetWardResponse[]>([])
const loading = ref(false)
const wardLoading = ref(false)
const importingWards = ref(false)
const searchText = ref('')
const activeTab = ref('provinces')
const selectedProvinceCode = ref<string | undefined>()
const selectedProvinceCodeForImport = ref<string | undefined>()
const wardJsonInput = ref('')

const filteredProvinces = computed(() => {
    const keyword = searchText.value.trim().toLowerCase()
    if (!keyword) return provinces.value

    return provinces.value.filter((item) => {
        return [item.name, item.provinceCode, item.locationSlug].some((value) => value.toLowerCase().includes(keyword))
    })
})

const provinceColumns = [
    {
        title: 'Tên tỉnh/thành phố',
        dataIndex: 'name',
        key: 'name',
        sorter: (a: IGetProvinceResponse, b: IGetProvinceResponse) => a.name.localeCompare(b.name),
    },
    {
        title: 'Mã tỉnh',
        dataIndex: 'provinceCode',
        key: 'provinceCode',
    },
    {
        title: 'Slug',
        dataIndex: 'locationSlug',
        key: 'locationSlug',
    },
    {
        title: 'Địa chỉ cũ',
        dataIndex: 'legacyAddress',
        key: 'legacyAddress',
        ellipsis: true,
    },
    {
        title: 'Thao tác',
        key: 'action',
    },
]

const wardColumns = [
    {
        title: 'Tên phường/xã',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Mã phường',
        dataIndex: 'wardCode',
        key: 'wardCode',
    },
    {
        title: 'Slug',
        dataIndex: 'locationSlug',
        key: 'locationSlug',
    },
    {
        title: 'Địa chỉ cũ',
        dataIndex: 'legacyAddress',
        key: 'legacyAddress',
        ellipsis: true,
    },
]

const loadProvinces = async () => {
    loading.value = true
    try {
        provinces.value = await ProvinceService.getProvinces()
    } catch (error) {
        message.error('Không thể tải danh sách tỉnh/thành phố')
        console.error(error)
    } finally {
        loading.value = false
    }
}

const loadWards = async (provinceCode?: string) => {
    if (!provinceCode) {
        wards.value = []
        return
    }

    wardLoading.value = true
    try {
        wards.value = await ProvinceService.getWardsByProvince(provinceCode)
    } catch (error) {
        message.error('Không thể tải danh sách phường/xã')
        console.error(error)
    } finally {
        wardLoading.value = false
    }
}

const openWardTab = (provinceCode: string) => {
    selectedProvinceCode.value = provinceCode
    activeTab.value = 'wards'
    loadWards(provinceCode)
}

const onProvinceChange = (value: string) => {
    selectedProvinceCode.value = value
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
        if (!Array.isArray(parsed)) {
            throw new Error('Payload phải là mảng JSON')
        }

        await ProvinceService.importWardsByProvince(selectedProvinceCodeForImport.value, parsed)
        message.success('Import ward thành công')
        await loadWards(selectedProvinceCodeForImport.value)
        wardJsonInput.value = ''
    } catch (error) {
        message.error('Import ward thất bại, vui lòng kiểm tra định dạng JSON')
        console.error(error)
    } finally {
        importingWards.value = false
    }
}

onMounted(() => {
    loadProvinces()
})
</script>

<style scoped>
.province-ward-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.page-header h2 {
    margin: 0 0 4px;
    font-size: 20px;
}

.page-header p {
    margin: 0;
    color: #666;
}

.toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
}

.import-card {
    margin-bottom: 16px;
}

.import-header {
    margin-bottom: 12px;
}

.import-header h3 {
    margin: 0 0 4px;
    font-size: 16px;
}

.import-header p {
    margin: 0;
    color: #666;
}

.import-controls {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}
</style>
