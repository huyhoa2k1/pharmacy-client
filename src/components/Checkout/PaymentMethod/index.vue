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

.payment-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.payment-option {
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: white;
}

.payment-option:hover {
    border-color: #d1d5db;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.payment-option.active {
    border-color: #8b5cf6;
    background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
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
    accent-color: #8b5cf6;
}

.radio-label {
    display: block;
    width: 20px;
    height: 20px;
    border: 2px solid #d1d5db;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
}

.radio-input:checked+.radio-label {
    background: #8b5cf6;
    border-color: #8b5cf6;
    box-shadow: inset 0 0 0 3px white;
}

.option-info {
    flex: 1;
}

.option-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
}

.option-desc {
    font-size: 13px;
    color: #6b7280;
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
    border: 2px solid #d1d5db;
    border-radius: 50%;
    background: white;
    transition: all 0.2s ease;
}

.radio-input:checked+.radio-label {
    background: #8b5cf6;
    border-color: #8b5cf6;
}

.radio-input:checked+.radio-label::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    background: white;
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
    border-color: #d1d5db;
}

.payment-option.active {
    border-color: #8b5cf6;
    background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
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
    background: #8b5cf6;
    border-color: #8b5cf6;
}

.form-actions :deep(.ant-btn-primary:hover) {
    background: #7c3aed;
    border-color: #7c3aed;
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