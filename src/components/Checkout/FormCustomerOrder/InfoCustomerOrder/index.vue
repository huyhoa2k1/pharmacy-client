<template>
    <div class="info-customer-order">
        <h3 class="form-title">{{ t('checkout.customerInfoTitle') }}</h3>

        <div class="form-grid">
            <div class="form-group">
                <label class="form-label">{{ t('checkout.fullNameLabel') }} <span class="required">*</span></label>
                <a-input v-model:value="checkoutStore.customerInfo.fullName" :placeholder="t('checkout.fullNamePlaceholder')" allow-clear
                    @change="validateForm" />
                <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
            </div>

            <div class="form-group">
                <label class="form-label">{{ t('checkout.phoneLabel') }} <span class="required">*</span></label>
                <a-input v-model:value="checkoutStore.customerInfo.phone" :placeholder="t('checkout.phonePlaceholder')" allow-clear
                    @change="validateForm" />
                <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
            </div>

            <div class="form-group">
                <label class="form-label">{{ t('checkout.emailLabel') }} <span class="required">*</span></label>
                <a-input v-model:value="checkoutStore.customerInfo.email" type="email" :placeholder="t('checkout.emailPlaceholder')"
                    allow-clear @change="validateForm" />
                <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            </div>
        </div>

        <div class="form-group">
            <label class="form-label">{{ t('checkout.noteLabel') }} <span class="optional">{{ t('checkout.noteOptional') }}</span></label>
            <a-textarea v-model:value="checkoutStore.customerInfo.note" :placeholder="t('checkout.notePlaceholder')" :rows="4"
                allow-clear />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCheckoutStore } from '@/stores/checkoutStore';

interface Errors {
    fullName?: string;
    phone?: string;
    email?: string;
}

const { t } = useI18n();
const checkoutStore = useCheckoutStore();
const errors = ref<Errors>({});

// Validate email
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate phone
const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
    return phoneRegex.test(phone);
};

const validateForm = (): boolean => {
    errors.value = {};

    if (!checkoutStore.customerInfo.fullName?.trim()) {
        errors.value.fullName = t('checkout.fullNameRequired');
    } else if (checkoutStore.customerInfo.fullName.length < 3) {
        errors.value.fullName = t('checkout.fullNameMinLength');
    }

    if (!checkoutStore.customerInfo.phone?.trim()) {
        errors.value.phone = t('checkout.phoneRequired');
    } else if (!isValidPhone(checkoutStore.customerInfo.phone)) {
        errors.value.phone = t('checkout.phoneInvalid');
    }

    if (!checkoutStore.customerInfo.email?.trim()) {
        errors.value.email = t('checkout.emailRequired');
    } else if (!isValidEmail(checkoutStore.customerInfo.email)) {
        errors.value.email = t('checkout.emailInvalid');
    }

    return Object.keys(errors.value).length === 0;
};
</script>

<style scoped>
.info-customer-order {
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

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
}

.form-group {
    margin-bottom: 16px;
}

.form-group:last-child {
    margin-bottom: 0;
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

.optional {
    color: var(--color-muted-foreground);
    font-weight: 400;
    font-size: 12px;
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
    font-size: 14px;
}

.form-actions :deep(.ant-btn-primary) {
    background: var(--color-accent);
    border-color: var(--color-accent);
}

.form-actions :deep(.ant-btn-primary:hover) {
    background: color-mix(in srgb, var(--color-accent) 90%, #000000);
    border-color: color-mix(in srgb, var(--color-accent) 90%, #000000);
}

/* Input styling */
:deep(.ant-input),
:deep(.ant-input-textarea) {
    border-radius: 6px;
    border-color: var(--color-border) !important;
    transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

:deep(.ant-input:hover),
:deep(.ant-input-textarea:hover) {
    border-color: var(--color-primary) !important;
}

:deep(.ant-input:focus),
:deep(.ant-input-textarea:focus) {
    border-color: var(--color-primary) !important;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-ring) 20%, transparent) !important;
}

:deep(.ant-input-textarea textarea:focus) {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-ring) 20%, transparent) !important;
}

/* Responsive */
@media (max-width: 768px) {
    .info-customer-order {
        padding: 16px;
    }

    .form-title {
        font-size: 16px;
        margin-bottom: 16px;
    }

    .form-grid {
        grid-template-columns: 1fr;
        gap: 14px;
        margin-bottom: 14px;
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