<template>
    <div class="cart-right flex flex-col space-y-4">
        <div>
            <div class="cart-summary-card promotion-card">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                        <i class="pi pi-receipt cart-summary-icon"></i>
                        <span>Khuyến mãi</span>
                    </div>
                    <div>
                        <button @click="$emit('showDrawer')" class="promotion-button">Chọn mã</button>
                    </div>
                </div>
            </div>
        </div>
        <div>
            <div
                class="cart-summary-card grid grid-flow-col items-center gap-2 md:grid-flow-row md:items-start md:gap-4">
                <div class="grid gap-4">
                    <div class="hidden grid-flow-col items-center justify-between gap-2 md:grid">
                        <p class="text-sm text-neutral-900">Tạm tính</p>
                        <p class="text-sm font-semibold text-neutral-900">{{ formattedSubTotal }}</p>
                    </div>
                    <div class="hidden grid-flow-col items-center justify-between gap-2 md:grid">
                        <p class="text-sm text-neutral-900">Giảm giá ưu đãi</p>
                        <p class="text-sm font-semibold text-neutral-900">-</p>
                    </div>
                    <div class="hidden grid-flow-col items-center justify-between gap-2 md:grid">
                        <p class="text-sm text-neutral-900">Giảm giá sản phẩm</p>
                        <p class="text-sm font-semibold text-neutral-900">-</p>
                    </div>
                    <div class="summary-divider hidden w-full md:block"></div>
                    <div
                        class="grid items-center justify-items-end gap-0.5 md:grid-flow-col md:justify-between md:gap-2">
                        <p class="text-sm text-neutral-900 md:text-base md:font-semibold">Tổng tiền</p>
                        <p class="total-price text-xl font-bold leading-8 no-underline md:text-2xl">{{
                            formattedSubTotal }}</p>
                    </div>
                </div>
                <a-button type="primary" class="w-full md:w-auto"
                    @click="isCartPage ? router.push('/check-out') : $emit('submitOrder')" :loading="isSubmitting">
                    <i v-if="!isSubmitting" class="pi pi-shopping-cart mr-2"></i>
                    {{ isSubmitting ? 'Đang xử lý...' : `Mua hàng (${totalQuantity})` }}
                </a-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { IGetProductResponse } from '@/api/models/product';
import { formatPrice } from '@/utils/format';

interface CartSummaryItem extends Partial<IGetProductResponse> {
    cartQuantity: number;
    addedAt: number;
    checked?: boolean;
}

const props = defineProps<{
    items: CartSummaryItem[],
    isSubmitting?: boolean
}>();
defineEmits(['showDrawer', 'submitOrder']);

const router = useRouter();
const isCartPage = router.currentRoute.value.name === 'cart';
console.log('isCartPage:', isCartPage, router.currentRoute.value.name);

// Parse price từ string hoặc number
const parsePrice = (price: string | number | undefined): number => {
    if (typeof price === 'number') return price;
    if (!price) return 0;
    // Remove all non-digit characters and convert to number
    return Number(price.toString().replace(/[^\d]/g, ''));
};

// Calculate subtotal as number (không format)
const subTotal = computed(() => {
    return props.items.reduce((sum, item) => {
        const price = parsePrice(item.price);
        const quantity = item.cartQuantity || 1;
        return sum + (price * quantity);
    }, 0);
});

// Format subtotal để hiển thị
const formattedSubTotal = computed(() => {
    return formatPrice(subTotal.value);
});

// Calculate total quantity
const totalQuantity = computed(() => {
    return props.items.reduce((sum, item) => sum + (item.cartQuantity || 1), 0);
});

</script>

<style scoped>
.cart-right {
    position: sticky;
    top: 20px;
    max-width: 100%;
}

.cart-summary-card {
    padding: var(--space-md);
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    color: var(--color-foreground);
}

.promotion-card {
    background: color-mix(in srgb, var(--color-secondary) 12%, var(--color-card));
}

.cart-summary-icon,
.promotion-button {
    color: var(--color-primary);
}

.promotion-button {
    padding: 4px 8px;
    border-radius: var(--radius-sm);
    font-weight: 600;
    cursor: pointer;
    transition: color var(--transition-base), background-color var(--transition-base);
}

.promotion-button:hover {
    color: var(--color-foreground);
    background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.promotion-button:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--color-ring) 35%, transparent);
    outline-offset: 2px;
}

.summary-divider {
    height: 1px;
    background: var(--color-border);
}

.total-price {
    color: var(--color-destructive);
}

.cart-summary-card :deep(.text-neutral-900) {
    color: var(--color-foreground);
}

@media (prefers-reduced-motion: reduce) {
    .promotion-button {
        transition: none;
    }
}

@media (max-width: 1024px) {
    .cart-right {
        position: static;
    }
}
</style>