<template>
    <div class="payment-result">
        <a-spin v-if="state === 'loading'" size="large" :tip="t('paymentResult.checking')" />

        <a-result v-else-if="state === 'paid'" status="success" :title="t('paymentResult.paidTitle')"
            :sub-title="t('paymentResult.paidDesc', { code: status?.orderCode })">
            <template #extra>
                <a-button type="primary" @click="router.push('/ca-nhan/don-hang')">{{ t('paymentResult.viewOrders')
                    }}</a-button>
                <a-button @click="router.push('/')">{{ t('paymentResult.continueShopping') }}</a-button>
            </template>
        </a-result>

        <a-result v-else-if="state === 'cancelled'" status="warning" :title="t('paymentResult.cancelledTitle')"
            :sub-title="t('paymentResult.cancelledDesc', { code: status?.orderCode })">
            <template #extra>
                <a-button type="primary" @click="router.push('/')">{{ t('paymentResult.continueShopping') }}</a-button>
            </template>
        </a-result>

        <a-result v-else-if="state === 'pending'" status="info" :title="t('paymentResult.pendingTitle')"
            :sub-title="t('paymentResult.pendingDesc', { code: status?.orderCode })">
            <template #extra>
                <a-button type="primary" @click="checkStatus">{{ t('paymentResult.recheck') }}</a-button>
                <a-button @click="router.push('/ca-nhan/don-hang')">{{ t('paymentResult.viewOrders') }}</a-button>
            </template>
        </a-result>

        <a-result v-else status="error" :title="t('paymentResult.errorTitle')"
            :sub-title="t('paymentResult.errorDesc')">
            <template #extra>
                <a-button type="primary" @click="router.push('/')">{{ t('paymentResult.continueShopping') }}</a-button>
            </template>
        </a-result>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { PaymentService, type IPaymentStatus } from '@/api/services/payment';

type ResultState = 'loading' | 'paid' | 'cancelled' | 'pending' | 'error';

const MAX_AUTO_CHECKS = 5;
const CHECK_INTERVAL_MS = 2000;

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const state = ref<ResultState>('loading');
const status = ref<IPaymentStatus | null>(null);
let timer: ReturnType<typeof setTimeout> | undefined;
let attempts = 0;

// PayOS gắn orderCode vào query khi chuyển về returnUrl / cancelUrl
const payosOrderCode = (): string | null => {
    const value = route.query.orderCode;
    const code = Array.isArray(value) ? value[0] : value;
    return code && /^\d+$/.test(code) ? code : null;
};

const checkStatus = async () => {
    const code = payosOrderCode();
    if (!code) {
        state.value = 'error';
        return;
    }
    clearTimeout(timer);
    state.value = 'loading';
    try {
        status.value = await PaymentService.getPaymentStatus(code);
    } catch (error) {
        console.error('Payment status error:', error);
        state.value = 'error';
        return;
    }
    if (!status.value) {
        state.value = 'error';
    } else if (status.value.paymentStatus === 'PAID') {
        state.value = 'paid';
    } else if (status.value.paymentStatus === 'CANCELLED') {
        state.value = 'cancelled';
    } else if (++attempts < MAX_AUTO_CHECKS) {
        // Webhook có thể đến chậm vài giây, thử lại trước khi báo "đang xử lý"
        timer = setTimeout(checkStatus, CHECK_INTERVAL_MS);
    } else {
        state.value = 'pending';
    }
};

onMounted(checkStatus);
onBeforeUnmount(() => clearTimeout(timer));
</script>

<style scoped>
.payment-result {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
    padding: var(--space-lg);
}
</style>
