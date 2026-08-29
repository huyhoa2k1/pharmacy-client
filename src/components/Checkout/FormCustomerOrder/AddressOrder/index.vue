<template>
    <div class="address-form">
        <h3 class="form-title">Địa chỉ nhận hàng</h3>

        <div class="form-group">
            <label class="form-label">Tỉnh / Thành phố <span class="required">*</span></label>
            <a-select v-model:value="checkoutStore.addressInfo.province" placeholder="Chọn tỉnh / thành phố"
                :options="provinces" :filter-option="filterOption" show-search @change="onProvinceChange"
                class="w-full" />
            <span v-if="errors.province" class="error-message">{{ errors.province }}</span>
        </div>

        <div class="form-group">
            <label class="form-label">Phường / Xã <span class="required">*</span></label>
            <a-select v-model:value="checkoutStore.addressInfo.ward" placeholder="Chọn phường / xã" :options="wards"
                :filter-option="filterOption" show-search :disabled="!checkoutStore.addressInfo.province"
                @change="validateForm" class="w-full" />
            <span v-if="errors.ward" class="error-message">{{ errors.ward }}</span>
        </div>

        <div class="form-group">
            <label class="form-label">Địa chỉ cụ thể <span class="required">*</span></label>
            <a-input v-model:value="checkoutStore.addressInfo.address" placeholder="Nhập số nhà, tên đường..."
                allow-clear @change="validateForm" />
            <span v-if="errors.address" class="error-message">{{ errors.address }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { ProvinceService } from '@/api/services/province';

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
});

watch(() => checkoutStore.addressInfo.province, (newProvince) => {
    getWards(newProvince);
});

const filterOption = (input: string, option: SelectOption) => {
    return option.label.toLowerCase().includes(input.toLowerCase());
};

const onProvinceChange = () => {
    checkoutStore.addressInfo.ward = '';
    errors.value.district = undefined;
    errors.value.ward = undefined;
};


const validateForm = (): boolean => {
    errors.value = {};

    if (!checkoutStore.addressInfo.province) {
        errors.value.province = 'Vui lòng chọn tỉnh / thành phố';
    }

    if (!checkoutStore.addressInfo.ward) {
        errors.value.ward = 'Vui lòng chọn phường / xã';
    }

    if (!checkoutStore.addressInfo.address?.trim()) {
        errors.value.address = 'Vui lòng nhập địa chỉ cụ thể';
    } else if (checkoutStore.addressInfo.address.length < 5) {
        errors.value.address = 'Địa chỉ phải có ít nhất 5 ký tự';
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