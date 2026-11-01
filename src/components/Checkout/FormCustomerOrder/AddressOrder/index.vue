<template>
    <div class="address-form">
        <h3 class="form-title">{{ t('checkout.addressFormTitle') }}</h3>

        <div class="form-group">
            <label class="form-label">{{ t('checkout.provinceLabel') }} <span class="required">*</span></label>
            <a-select v-model:value="checkoutStore.addressInfo.province"
                :placeholder="t('checkout.provincePlaceholder')" :options="provinces" :filter-option="filterOption"
                show-search @change="onProvinceChange" class="w-full" />
            <span v-if="errors.province" class="error-message">{{ errors.province }}</span>
        </div>

        <div class="form-group">
            <label class="form-label">{{ t('checkout.wardLabel') }} <span class="required">*</span></label>
            <a-select v-model:value="checkoutStore.addressInfo.ward" :placeholder="t('checkout.wardPlaceholder')"
                :options="wards" :filter-option="filterOption" show-search
                :disabled="!checkoutStore.addressInfo.province" @change="validateForm" class="w-full" />
            <span v-if="errors.ward" class="error-message">{{ errors.ward }}</span>
        </div>

        <div class="form-group">
            <label class="form-label">{{ t('checkout.addressLabel') }} <span class="required">*</span></label>
            <a-input v-model:value="checkoutStore.addressInfo.address" :placeholder="t('checkout.addressPlaceholder')"
                allow-clear @change="validateForm" />
            <span v-if="errors.address" class="error-message">{{ errors.address }}</span>
        </div>

        <div class="form-group">
            <label class="form-label">{{ t('checkout.locationLabel') }} <span class="required">*</span></label>
            <div class="location-tools">
                <a-auto-complete v-model:value="searchText" :options="searchOptions" :filter-option="false"
                    :placeholder="t('checkout.locationSearchPlaceholder')" class="w-full" allow-clear @search="onSearch"
                    @select="onSelectPlace" />
                <a-button :loading="locating" @click="useMyLocation">
                    <i class="pi pi-map-marker mr-1"></i>{{ t('checkout.useMyLocation') }}
                </a-button>
            </div>
            <p class="location-hint">{{ t('checkout.locationHint') }}</p>
            <MapPicker v-model="point" :store-markers="storeMarkers" height="320px" />
            <p v-if="locationName" class="location-name">{{ locationName }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { debounce } from 'lodash';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { ProvinceService } from '@/api/services/province';
import { GeoService, StoreService } from '@/api/services/store';
import type { IGeoPlace, IMapPoint, IMapStoreMarker } from '@/api/models/store';
import MapPicker from '@/components/common/MapPicker/index.vue';

interface SelectOption {
    label: string;
    value: string;
}

interface Errors {
    province?: string;
    district?: string;
    ward?: string;
    address?: string;
}

const { t } = useI18n();
const checkoutStore = useCheckoutStore();
const errors = ref<Errors>({});
const provinces = ref<SelectOption[]>([]);
const wards = ref<SelectOption[]>([]);

const getProvinces = async () => {
    const res = await ProvinceService.getProvinces();
    provinces.value = res.map((p) => ({ label: p.name, value: p.provinceCode }));
};

const getWards = async (provinceCode: string) => {
    if (provinceCode) {
        const res = await ProvinceService.getWardsByProvince(provinceCode);
        wards.value = res.map((w) => ({ label: w.name, value: w.wardCode }));
    } else {
        wards.value = [];
    }
};

onMounted(() => {
    getProvinces();
    loadStoreMarkers();
});

// Hiện các cửa hàng trên bản đồ để khách thấy cửa hàng gần mình
const storeMarkers = ref<IMapStoreMarker[]>([]);
const loadStoreMarkers = async () => {
    try {
        const stores = await StoreService.getStores();
        storeMarkers.value = stores.map((s) => ({ id: s.id, label: s.name, lat: s.latitude, lng: s.longitude }));
    } catch {
        storeMarkers.value = [];
    }
};

const searchText = ref('');
const searchResults = ref<IGeoPlace[]>([]);
const searchOptions = computed(() => searchResults.value.map((p) => ({ value: p.displayName, label: p.displayName })));
const locationName = ref('');
const locating = ref(false);
// Khi khách đã tự đặt ghim thì không tự gợi ý lại từ địa chỉ nữa
const pinTouched = ref(false);

const point = computed<IMapPoint | null>({
    get: () => {
        const { latitude, longitude } = checkoutStore.addressInfo;
        return latitude !== null && longitude !== null ? { lat: latitude, lng: longitude } : null;
    },
    // Khách bấm/kéo ghim trên bản đồ
    set: (value) => {
        if (value) applyPoint(value);
    },
});

// Điền địa chỉ cụ thể từ tên vị trí nếu khách chưa nhập
const applyLabel = (label: string) => {
    locationName.value = label;
    if (!checkoutStore.addressInfo.address?.trim()) {
        checkoutStore.addressInfo.address = label;
    }
};

const applyPoint = async (value: IMapPoint, label?: string) => {
    pinTouched.value = true;
    checkoutStore.addressInfo.latitude = value.lat;
    checkoutStore.addressInfo.longitude = value.lng;
    if (label) {
        applyLabel(label);
        return;
    }
    locationName.value = '';
    const place = await GeoService.reverse(value.lat, value.lng);
    // Bỏ kết quả cũ nếu khách đã di chuyển ghim sang chỗ khác
    if (place && checkoutStore.addressInfo.latitude === value.lat && checkoutStore.addressInfo.longitude === value.lng) {
        applyLabel(place.displayName);
    }
};

const runSearch = debounce(async (query: string) => {
    if (query.trim().length < 3) {
        searchResults.value = [];
        return;
    }
    try {
        searchResults.value = await GeoService.search(query);
    } catch {
        searchResults.value = [];
        message.error(t('checkout.locationSearchError'));
    }
}, 700);

const onSearch = (query: string) => {
    runSearch(query);
};

const onSelectPlace = (value: string) => {
    const place = searchResults.value.find((p) => p.displayName === value);
    if (place) {
        applyPoint({ lat: place.latitude, lng: place.longitude }, place.displayName);
    }
};

const useMyLocation = () => {
    if (!navigator.geolocation) {
        message.warning(t('checkout.locationUnsupported'));
        return;
    }
    locating.value = true;
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            locating.value = false;
            applyPoint({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
            locating.value = false;
            message.warning(t('checkout.locationDenied'));
        },
        { enableHighAccuracy: true, timeout: 10000 },
    );
};

// Đặt sẵn ghim theo địa chỉ đã điền để khách chỉ cần kéo ghim đến đúng chỗ
const suggestFromAddress = debounce(async () => {
    const { province, ward, address } = checkoutStore.addressInfo;
    if (pinTouched.value || !province || !ward || (address?.trim().length ?? 0) < 5) return;
    const provinceLabel = provinces.value.find((p) => p.value === province)?.label ?? '';
    const wardLabel = wards.value.find((w) => w.value === ward)?.label ?? '';
    const queries = [
        [address.trim(), wardLabel, provinceLabel, 'Việt Nam'].join(', '),
        [wardLabel, provinceLabel, 'Việt Nam'].join(', '),
    ];
    for (const query of queries) {
        let places: IGeoPlace[] = [];
        try {
            places = await GeoService.search(query);
        } catch {
            return;
        }
        if (pinTouched.value) return;
        if (places.length > 0) {
            checkoutStore.addressInfo.latitude = places[0].latitude;
            checkoutStore.addressInfo.longitude = places[0].longitude;
            locationName.value = places[0].displayName;
            return;
        }
    }
}, 1200);

watch(
    () => [checkoutStore.addressInfo.province, checkoutStore.addressInfo.ward, checkoutStore.addressInfo.address],
    () => suggestFromAddress(),
);

watch(() => checkoutStore.addressInfo.province, (newProvince) => {
    getWards(newProvince);
});

const filterOption = (input: string, option: SelectOption) => {
    return option.label.toLowerCase().includes(input.toLowerCase());
};

const onProvinceChange = () => {
    checkoutStore.addressInfo.ward = '';
    // Đổi tỉnh thì ghim cũ không còn đúng
    checkoutStore.addressInfo.latitude = null;
    checkoutStore.addressInfo.longitude = null;
    locationName.value = '';
    pinTouched.value = false;
    errors.value.district = undefined;
    errors.value.ward = undefined;
};


const validateForm = (): boolean => {
    errors.value = {};

    if (!checkoutStore.addressInfo.province) {
        errors.value.province = t('checkout.provinceRequired');
    }

    if (!checkoutStore.addressInfo.ward) {
        errors.value.ward = t('checkout.wardRequired');
    }

    if (!checkoutStore.addressInfo.address?.trim()) {
        errors.value.address = t('checkout.addressRequired');
    } else if (checkoutStore.addressInfo.address.length < 5) {
        errors.value.address = t('checkout.addressMinLength');
    }

    return Object.keys(errors.value).length === 0;
};
</script>

<style scoped>
.address-form {
    background: var(--color-card);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    padding: 20px;
    box-shadow: var(--shadow-sm);
}

.form-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-foreground);
    margin: 0 0 20px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--color-border);
}

.form-group {
    margin-bottom: 16px;
}

.form-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-foreground);
    margin-bottom: 8px;
}

.required {
    color: var(--color-destructive);
}

.location-tools {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
}

.location-hint {
    font-size: 12px;
    color: var(--color-muted-foreground);
    margin: 0 0 8px 0;
}

.location-name {
    font-size: 13px;
    color: var(--color-foreground);
    margin: 8px 0 0 0;
}

.error-message {
    display: block;
    font-size: 12px;
    color: var(--color-destructive);
    margin-top: 6px;
}

.form-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);
}

.form-actions :deep(.ant-btn) {
    flex: 1;
    height: 40px;
    font-weight: 600;
    border-radius: 6px;
}

.form-actions :deep(.ant-btn-primary) {
    background: var(--color-accent);
    border-color: var(--color-accent);
}

.form-actions :deep(.ant-btn-primary:hover) {
    background: color-mix(in srgb, var(--color-accent) 90%, #000000);
    border-color: color-mix(in srgb, var(--color-accent) 90%, #000000);
}

/* Select styling */
:deep(.ant-select-selector) {
    border-radius: 6px !important;
    border-color: var(--color-border) !important;
    transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

:deep(.ant-select-selector:hover) {
    border-color: var(--color-primary) !important;
}

:deep(.ant-select-focused .ant-select-selector) {
    border-color: var(--color-primary) !important;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-ring) 20%, transparent) !important;
}

/* Input styling */
:deep(.ant-input) {
    border-radius: 6px;
    border-color: var(--color-border);
    transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

:deep(.ant-input:hover) {
    border-color: var(--color-primary);
}

:deep(.ant-input:focus) {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-ring) 20%, transparent);
}

/* Responsive */
@media (max-width: 768px) {
    .address-form {
        padding: 16px;
    }

    .form-title {
        font-size: 16px;
        margin-bottom: 16px;
    }

    .form-group {
        margin-bottom: 14px;
    }

    .form-actions {
        flex-direction: column;
    }

    .form-actions :deep(.ant-btn) {
        width: 100%;
    }
}
</style>