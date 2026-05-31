<template>
    <div @click="goToProductDetail"
        class="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 flex flex-col h-full cursor-pointer">

        <!-- Image Container -->
        <div class="relative w-full aspect-square overflow-hidden bg-white">
            <img class="object-contain w-full h-full p-3 transition-transform duration-300 group-hover:scale-105"
                :src="data.imageUrl[0]" alt="Product" />

            <!-- Sale Badge (top-left) -->
            <div v-if="data.discount > 0"
                class="absolute top-3 left-3 bg-red-500 text-white px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">
                -{{ data.discount }}%
            </div>
        </div>

        <!-- Content -->
        <div class="p-3 flex-1 flex flex-col justify-between">
            <!-- Product Name -->
            <div>
                <a-tooltip>
                    <template #title>
                        {{ data.name }}
                    </template>
                    <h3 class="text-sm font-medium text-gray-900 line-clamp-2 h-9">
                        {{ data.name }}
                    </h3>
                </a-tooltip>
            </div>

            <!-- Price + Cart -->
            <div class="mt-2 flex items-center justify-between">
                <div>
                    <div class="text-lg font-bold text-purple-500">
                        {{ formatPrice(data.price - (data.price * data.discount / 100)) }} đ
                    </div>
                    <div v-if="data.discount > 0" class="text-xs text-gray-400 line-through">
                        {{ formatPrice(data.price) }} đ
                    </div>
                </div>

                <button @click.stop="addToCart"
                    class="p-2 rounded-md border border-purple-200 text-purple-500 hover:bg-purple-500 hover:text-white transition">
                    <i class="pi pi-shopping-cart text-sm"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import router from '@/router';
import { useCartStore } from '@/stores/cart';
import type { CartItem } from '@/utils/index.type';

const cartStore = useCartStore();

const props = defineProps<{
    data: {
        id: number
        name: string
        slug: string
        description: string
        imageUrl: string[]
        price: number
        discount: number
        amount: number,
        brand: any,
        sold: number
        sale: boolean
        createdAt: string
        updatedAt: string
    };
}>();

function formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price);
}

const goToProductDetail = () => {
    router.push({
        name: 'product-detail',
        params: {
            categoryId: props.data.brand.categoryId,
            id: props.data.id,
        },
    })
}

const addToCart = () => {
    const existingItemIndex = cartStore.cart.findIndex((item) => item.id === props.data.id);

    if (existingItemIndex !== -1) {
        // If product already in cart, increase quantity
        cartStore.updateItem(existingItemIndex, cartStore.cart[existingItemIndex].cartQuantity + 1);
    } else {
        // If product not in cart, add new item
        const newItem: CartItem = {
            ...props.data,
            cartQuantity: 1,
            addedAt: Date.now(),
        };
        cartStore.addToCart(newItem);
    }

    message.success('Đã thêm vào giỏ hàng');
};

</script>

<style scoped></style>