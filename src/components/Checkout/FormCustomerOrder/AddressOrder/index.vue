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
    background: white;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.08);
}

.form-title {
    font-size: 18px;
    font-weight: 700;
    color: #4c1d95;
    margin: 0 0 20px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid #f3e8ff;
}

.form-group {
    margin-bottom: 16px;
}

.form-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
}

.required {
    color: #ef4444;
}

.error-message {
    display: block;
    font-size: 12px;
    color: #ef4444;
    margin-top: 6px;
}

.form-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #f3e8ff;
}

.form-actions :deep(.ant-btn) {
    flex: 1;
    height: 40px;
    font-weight: 600;
    border-radius: 6px;
}

.form-actions :deep(.ant-btn-primary) {
    background: #8b5cf6;
    border-color: #8b5cf6;
}

.form-actions :deep(.ant-btn-primary:hover) {
    background: #7c3aed;
    border-color: #7c3aed;
}

/* Select styling */
:deep(.ant-select-selector) {
    border-radius: 6px !important;
    border-color: #d1d5db !important;
    transition: all 0.2s ease;
}

:deep(.ant-select-selector:hover) {
    border-color: #8b5cf6 !important;
}

:deep(.ant-select-focused .ant-select-selector) {
    border-color: #8b5cf6 !important;
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1) !important;
}

/* Input styling */
:deep(.ant-input) {
    border-radius: 6px;
    border-color: #d1d5db;
    transition: all 0.2s ease;
}

:deep(.ant-input:hover) {
    border-color: #8b5cf6;
}

:deep(.ant-input:focus) {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
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