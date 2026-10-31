<template>
    <div class="cart-view">
        <div :class="[cartItems.length === 0 ? 'cart-left-empty' : 'cart-left']">
            <div v-if="cartItems.length > 0" class="list-product">
                <div class="flex justify-between items-center mb-4">
                    <h3 v-if="cartItems.length > 0" class="text-xl font-bold">{{ t('checkout.productsInOrder', { count: cartItems.length }) }}</h3>
                </div>
                <div class="space-y-0">
                    <!-- Cart items -->
                    <CheckoutItem v-for="(item, idx) in cartItems" :key="item.id" :checked="item.checked || false"
                        :name="item.name || ''" :image="item.imageUrl?.[0] || item.imageUrl[0] || ''"
                        :link="`/product/${item.id}`" :price="formatPrice(item.price)"
                        :quantity="item.cartQuantity || 1" :total="formatPrice(calculateItemTotal(item))"
                        :srcset="''" />
                </div>
            </div>
            <div v-if="cartItems.length === 0" class="text-center py-12">
                <Empty />
            </div>
            <div v-if="cartItems.length > 0">
                <InfoCustomerOrder />
                <AddressOrder />
                <PaymentMethod />
            </div>
        </div>
        <CartSummary v-if="cartItems.length > 0" :isSubmitting="isSubmitting" :items="cartItems"
            @showDrawer="showDrawer" @submitOrder="handleSubmitOrder" />
    </div>
    <Drawer v-model:open="open" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import CheckoutItem from '@/components/Checkout/ProductCheckout/index.vue';
import Drawer from '@/components/Cart/Drawer/index.vue';
import CartSummary from '@/components/Cart/CartSummary.vue';
import InfoCustomerOrder from '@/components/Checkout/FormCustomerOrder/InfoCustomerOrder/index.vue';
import AddressOrder from '@/components/Checkout/FormCustomerOrder/AddressOrder/index.vue';
import PaymentMethod from '@/components/Checkout/PaymentMethod/index.vue';
import type { IGetProductResponse } from '@/api/models/product';
import { formatPrice } from '@/utils/format';
import Empty from '@/components/common/empty/index.vue';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { useCartStore } from '@/stores/cart';
import { OrderService } from '@/api/services/order';
import { EPaymentMethod } from '@/api/models/order';
import { useRouter } from 'vue-router';
import { PaymentService } from '@/api/services/payment';

interface CartItem extends IGetProductResponse {
    checked?: boolean;
    cartQuantity: number;
    addedAt: number;
}

const { t } = useI18n();
const open = ref<boolean>(false);
const isSubmitting = ref(false);

const checkoutStore = useCheckoutStore();
const cartStore = useCartStore();
const router = useRouter();

const cartItems = computed(() => cartStore.cart as CartItem[]);

// Calculate total for item
const calculateItemTotal = (item: CartItem): number => {
    const price = (item.price);
    const quantity = item.cartQuantity || 1;
    return price * quantity;
};

const showDrawer = () => {
    open.value = true;
};

onMounted(() => {
    // Load cart from store on component mount
    cartStore.loadCart();
    if (cartItems.value.length === 0) {
        message.warning(t('checkout.emptyCartWarning'));
    }
});

// Validate all checkout data before submit
const validateCheckout = (): boolean => {
    if (!checkoutStore.customerInfo.fullName?.trim()) {
        message.error(t('checkout.fullNameRequired'));
        return false;
    }

    if (!checkoutStore.customerInfo.phone?.trim()) {
        message.error(t('checkout.phoneRequired'));
        return false;
    }

    if (!checkoutStore.addressInfo.province) {
        message.error(t('checkout.provinceRequired'));
        return false;
    }

    // if (!checkoutStore.addressInfo.district) {
    //     message.error('Vui lòng chọn quận / huyện');
    //     return false;
    // }

    if (!checkoutStore.addressInfo.ward) {
        message.error(t('checkout.wardRequired'));
        return false;
    }

    if (!checkoutStore.addressInfo.address?.trim()) {
        message.error(t('checkout.addressRequired'));
        return false;
    }

    return true;
};

const handleSubmitOrder = async () => {
    if (!validateCheckout()) {
        return;
    }

    if (cartItems.value.length === 0) {
        message.error(t('checkout.emptyCartError'));
        return;
    }
    isSubmitting.value = true;
    try {
        const orderData = {
            paymentMethod: checkoutStore.paymentMethod,
            shippingAddress: {
                province: checkoutStore.addressInfo.province,
                district: '',
                ward: checkoutStore.addressInfo.ward,
                address: checkoutStore.addressInfo.address,
                fullname: checkoutStore.customerInfo.fullName,
                phone: checkoutStore.customerInfo.phone,
            },
            orderItems: cartItems.value.map(item => ({
                productId: item.id,
                amount: item.cartQuantity
            }))
        };
        const order = await OrderService.createOrder(orderData);
        if (!order?.id) {
            message.error(t('checkout.createOrderError'));
            return;
        }

        const isOnlinePayment = checkoutStore.paymentMethod === EPaymentMethod.CARD;
        // Đơn đã tạo (đã giữ tồn kho) nên dọn giỏ hàng ngay, kể cả khi sang trang thanh toán
        checkoutStore.resetCheckout();
        cartStore.clearCart();

        if (!isOnlinePayment) {
            message.success(t('checkout.orderSuccess'));
            router.push('/');
            return;
        }

        try {
            const link = await PaymentService.createPaymentLink(order.id);
            if (!link?.checkoutUrl) {
                throw new Error('Missing checkoutUrl');
            }
            // PayOS sẽ chuyển về /payment/result?orderCode=...&status=... sau khi thanh toán hoặc huỷ
            window.location.href = link.checkoutUrl;
        } catch (error) {
            console.error('Payment link error:', error);
            message.error(t('checkout.paymentLinkError'));
            router.push('/ca-nhan/don-hang');
        }
    } catch (error) {
        console.error('Create order error:', error);
        message.error(t('checkout.createOrderError'));
    } finally {
        isSubmitting.value = false;

    }
};
</script>

<style scoped>
.cart-view {
    display: grid;
    gap: var(--space-lg);
    padding: var(--space-md);
    max-width: 1280px;
    margin: 0 auto;
    background: var(--color-background);
    min-height: calc(100vh - 200px);
    position: relative;
    z-index: 1;
}

.cart-no-item {
    grid-template-columns: minmax(0, 1fr) minmax(220px, 320px);
}

.cart-left {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    min-width: 0;
}

.cart-left-empty {
    display: flex;
    justify-content: center;
    align-items: center;
}

.list-product {
    background: var(--color-card);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    padding: var(--space-md);
    box-shadow: var(--shadow-md);
    min-width: 0;
    overflow: hidden;
}

.list-product h3 {
    color: var(--color-foreground);
    font-family: Figtree, Arial, sans-serif;
    margin: 0;
}

/* Empty cart styling */
.pi-shopping-cart {
    color: var(--color-primary);
    opacity: 0.65;
}

/* Responsive: dưới 768px chuyển sang 1 cột */
@media (max-width: 1024px) {
    .cart-view {
        grid-template-columns: 1fr;
        gap: var(--space-md);
    }
}

@media (max-width: 768px) {
    .cart-view {
        grid-template-columns: 1fr;
        padding: 12px;
        gap: var(--space-md);
    }

    .list-product {
        padding: var(--space-md);
    }
}
</style>