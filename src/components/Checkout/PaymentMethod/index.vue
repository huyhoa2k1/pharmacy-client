<template>
    <div class="payment-method">
        <h3 class="form-title">Phương thức thanh toán</h3>

        <div class="payment-options">
            <div v-for="option in paymentOptions" :key="option.id" class="payment-option"
                :class="{ active: selectedOption === option.id }" @click="selectPayment(option)">
                <label :for="option.id" class="option-header">
                    <div class="radio-wrapper">
                        <input type="radio" :id="option.id" name="payment-method" :value="option.id"
                            v-model="selectedOption" class="radio-input" />
                        <span class="radio-label"></span>
                    </div>
                    <div class="option-info">
                        <div>
                            <h4 class="option-title">{{ option.title }}</h4>
                            <p class="option-desc">{{ option.desc }}</p>
                        </div>
                    </div>
                </label>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { EPaymentMethod } from '@/api/models/order';
import { useCheckoutStore } from '@/stores/checkoutStore';

interface PaymentOption {
    id: string;
    value: EPaymentMethod;
    title: string;
    desc: string;
}

const checkoutStore = useCheckoutStore();
const selectedOption = ref('payment-cod');
const paymentOptions: PaymentOption[] = [
    {
        id: 'payment-cod',
        value: EPaymentMethod.CASH,
        title: 'Thanh toán tiền mặt khi nhận hàng',
        desc: 'Thanh toán tiền mặt khi nhận hàng',
    },
    {
        id: 'payment-qr',
        value: EPaymentMethod.CARD,
        title: 'Thanh toán bằng chuyển khoản (QR Code)',
        desc: 'Chuyển khoản nhanh qua QR Code',
    },
];

const selectPayment = (option: PaymentOption) => {
    selectedOption.value = option.id;
    checkoutStore.setPaymentMethod(option.value);
};

selectPayment(paymentOptions[0]);
</script>

<style scoped>
.payment-method {
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

.payment-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.payment-option {
    border: 2px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 16px;
    cursor: pointer;
    transition: border-color var(--transition-base), background-color var(--transition-base),
        box-shadow var(--transition-base);
    background: var(--color-card);
}

.payment-option:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
}

.payment-option.active {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-secondary) 16%, var(--color-card));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-ring) 20%, transparent);
}

.option-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
}

.radio-wrapper {
    flex-shrink: 0;
    margin-top: 2px;
}

.radio-input {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: var(--color-primary);
}

.radio-label {
    display: block;
    width: 20px;
    height: 20px;
    border: 2px solid var(--color-muted-foreground);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
}

.radio-input:checked+.radio-label {
    background: var(--color-primary);
    border-color: var(--color-primary);
    box-shadow: inset 0 0 0 3px white;
}

.option-info {
    flex: 1;
}

.option-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-foreground);
    margin: 0;
}

.option-desc {
    font-size: 13px;
    color: var(--color-muted-foreground);
    margin: 4px 0 0 0;
}

.radio-wrapper {
    flex-shrink: 0;
    position: relative;
    width: 22px;
    height: 22px;
}

.radio-input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    cursor: pointer;
    z-index: 2;
}

.radio-label {
    position: absolute;
    inset: 0;
    display: block;
    border: 2px solid var(--color-muted-foreground);
    border-radius: 50%;
    background: var(--color-card);
    transition: border-color var(--transition-base), background-color var(--transition-base),
        box-shadow var(--transition-base);
}

.radio-input:checked+.radio-label {
    background: var(--color-primary);
    border-color: var(--color-primary);
}

.radio-input:checked+.radio-label::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    background: var(--color-card);
    border-radius: 50%;
    transform: translate(-50%, -50%);
}

.option-header {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    cursor: pointer;
}

.payment-option:hover {
    border-color: var(--color-primary);
}

.payment-option.active {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-secondary) 16%, var(--color-card));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-ring) 20%, transparent);
}

@media (max-width: 768px) {
    .payment-method {
        padding: 16px;
    }

    .form-title {
        font-size: 16px;
        margin-bottom: 16px;
    }

    .payment-options {
        grid-template-columns: 1fr;
        gap: 12px;
    }
}

.form-actions :deep(.ant-btn) {
    flex: 1;
    height: 44px;
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

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive */
@media (max-width: 768px) {
    .payment-method {
        padding: 16px;
    }

    .form-title {
        font-size: 16px;
        margin-bottom: 16px;
    }

    .payment-options {
        grid-template-columns: 1fr;
        gap: 12px;
    }

    .payment-option {
        padding: 14px;
    }

    .option-title {
        font-size: 15px;
    }

    .form-actions :deep(.ant-btn) {
        height: 40px;
        font-size: 13px;
    }
}
</style>