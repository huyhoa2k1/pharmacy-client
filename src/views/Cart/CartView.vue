<template>
    <div :class="['cart-view', cartItems.length > 0 ? 'cart-no-empty' : 'cart-empty']">
        <div :class="[cartItems.length > 0 ? 'cart-left' : 'cart-left-empty']">
            <div class="p-3">
                <div class="flex justify-between items-center">
                    <h3 v-if="cartItems.length > 0" class="text-2xl font-bold">Giỏ hàng ({{ cartItems.length }})</h3>
                    <a-popconfirm title="Bạn có chắc muốn xóa toàn bộ sản phẩm?" ok-text="Xóa" cancel-text="Hủy"
                        @confirm="confirm" @cancel="cancel">
                        <button class="cart-clear-button" v-if="cartItems.length > 0">Xóa tất cả</button>
                    </a-popconfirm>
                </div>
                <div class="grid gap-2 md:gap-6">
                    <div v-if="cartItems.length > 0" class="mt-4 p-4 free-shipping rounded">
                        <p>Miễn phí vận chuyển cho mọi đơn hàng từ 0đ</p>
                    </div>
                    <div class="grid gap-4">
                        <div v-if="cartItems.length > 0"
                            class="hidden grid-cols-[calc(16rem/16)_1fr_calc(24rem/16)] items-center gap-4 md:grid">
                            <a-checkbox :checked="checkedAll" @change="toggleCheckAll"></a-checkbox>
                            <div class="flex items-center space-x-4 justify-between">
                                <div class="grid flex-1 items-start gap-2">
                                    <p class="text-sm leading-4 text-neutral-900">Sản phẩm</p>
                                </div>
                                <div class="flex justify-center space-x-4">
                                    <p class="w-[calc(160rem/16)] text-center text-sm text-neutral-900">Giá</p>
                                    <p class="w-[calc(117rem/16)] text-center text-sm text-neutral-900">Số lượng</p>
                                    <p class="w-[calc(120rem/16)] text-end text-sm text-neutral-900">Tổng tiền</p>
                                </div>
                            </div>
                        </div>
                        <div v-if="cartItems.length > 0" class="divider-line hidden w-full md:block"></div>

                        <!-- Empty cart message -->
                        <div v-if="cartItems.length === 0" class="text-center py-12">
                            <Empty />
                        </div>

                        <!-- Cart items -->
                        <CartItem v-for="(item, idx) in cartItems" :key="item.id" :checked="item.checked"
                            :name="item.name" :image="item.imageUrl[0]" :link="`/products/${item.id}`"
                            :price="formatPrice(item.price)" :quantity="item.cartQuantity" :total="calculateTotal(item)"
                            @toggle="toggleItem(idx)" @increase="increaseItem(idx)" @decrease="decreaseItem(idx)"
                            @delete="deleteItem(idx)" @cancel="cancel" />
                    </div>
                </div>
            </div>
        </div>
        <CartSummary v-if="cartItems.length > 0" :items="cartItems" @showDrawer="showDrawer" />
    </div>
    <Drawer v-model:open="open" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import CartItem from '@/components/Cart/Item/CartItem.vue';
import Drawer from '@/components/Cart/Drawer/index.vue';
import CartSummary from '@/components/Cart/CartSummary.vue';
import { useCartStore } from '@/stores/cart';
import type { IGetProductResponse } from '@/api/models/product';
import Empty from '@/components/common/empty/index.vue';

interface CartViewItem extends IGetProductResponse {
    checked: boolean;
    cartQuantity: number;
    addedAt: number;
}

const cartStore = useCartStore();
const open = ref<boolean>(false);

const cartItems = computed(() => cartStore.cart as CartViewItem[]);

const checkedAll = computed({
    get: () => cartItems.value.length > 0 && cartItems.value.every(item => item.checked),
    set: (value) => cartStore.toggleCheckAll(value)
});

// Format price string (remove ₫ and non-digits, return number)
const formatPrice = (price: string | number | undefined | null): number => {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
        return Number(price.replace(/[^\d]/g, '')) || 0;
    }
    return 0;
};

// Calculate total for item
const calculateTotal = (item: CartViewItem): number => {
    const price = formatPrice(item.price);
    return price * (item.cartQuantity ?? 0);
};

const showDrawer = () => {
    open.value = true;
};

const confirm = () => {
    cartStore.clearCart();
    message.success('Đã xóa toàn bộ sản phẩm trong giỏ hàng');
};

const cancel = () => {
    message.info('Hủy thao tác');
};

function toggleCheckAll() {
    checkedAll.value = !checkedAll.value;
}

function toggleItem(idx: number) {
    cartStore.toggleItemCheck(idx);
}

function increaseItem(idx: number) {
    cartStore.updateItem(idx, cartItems.value[idx].cartQuantity + 1);
}

function decreaseItem(idx: number) {
    if (cartItems.value[idx].cartQuantity > 1) {
        cartStore.updateItem(idx, cartItems.value[idx].cartQuantity - 1);
    }
}

function deleteItem(idx: number) {
    const itemName = cartItems.value[idx].name;
    cartStore.removeFromCart(idx);
    message.success(`Đã xóa "${itemName}" khỏi giỏ hàng`);
}

onMounted(() => {
    // Load cart from store on component mount
    cartStore.loadCart();
    console.log('Loaded cart items:', cartItems.value);
});
</script>

<style scoped>
.cart-view {
    display: grid;
    gap: var(--space-lg);
    padding: var(--space-lg);
    max-width: 1280px;
    margin: 0 auto;
    background: var(--color-background);
    min-height: calc(100vh - 200px);
}

.cart-no-empty {
    grid-template-columns: 1fr 320px;
}

/* Left panel */
.cart-left {
    background: var(--color-card);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    border: 1px solid var(--color-border);
}

.cart-left-empty {
    display: flex;
    justify-content: center;
    align-items: center;
}

.cart-left>div {
    padding: var(--space-lg);
}

.free-shipping {
    background: color-mix(in srgb, var(--color-secondary) 18%, var(--color-card));
    border: 1px solid var(--color-border);
    color: var(--color-foreground);
    font-weight: 600;
    border-radius: var(--radius-sm);
}

.divider-line {
    height: 1px;
    background: var(--color-border);
    margin: 8px 0 0 0;
}

.cart-left h3 {
    color: var(--color-foreground);
    font-family: Figtree, Arial, sans-serif;
}

.cart-left p,
.cart-left .text-sm {
    color: var(--color-foreground);
}

.cart-clear-button {
    color: var(--color-primary);
    font-weight: 600;
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: color var(--transition-base), background-color var(--transition-base);
}

.cart-clear-button:hover {
    color: var(--color-foreground);
    background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
    text-decoration: none;
}

.cart-clear-button:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--color-ring) 35%, transparent);
    outline-offset: 2px;
}

.cart-left :deep(.ant-checkbox) {
    --ant-primary-color: var(--color-primary);
}

.cart-left :deep(.ant-checkbox-inner) {
    border-color: var(--color-muted-foreground);
    border-radius: 4px;
}

.cart-left :deep(.ant-checkbox-checked .ant-checkbox-inner) {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
}

.cart-left :deep(.text-neutral-900) {
    color: var(--color-foreground);
}

.pi-shopping-cart {
    color: var(--color-primary);
    opacity: 0.65;
}

@media (prefers-reduced-motion: reduce) {
    .cart-clear-button {
        transition: none;
    }
}

@media (max-width: 1024px) {
    .cart-view {
        grid-template-columns: 1fr;
        gap: var(--space-md);
        padding: var(--space-md);
    }
}

@media (max-width: 768px) {
    .cart-view {
        padding: 12px;
        gap: var(--space-md);
    }

    .cart-left>div {
        padding: var(--space-md);
    }
}
</style>