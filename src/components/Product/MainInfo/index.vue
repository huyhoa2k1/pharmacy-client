<template>
    <div class="flex flex-col gap-6">
        <!-- Brand -->
        <div class="flex items-center gap-2">
            <span class="text-[var(--color-muted-foreground)] text-xs font-medium">Thương hiệu:</span>
            <span class="text-[var(--color-primary)] font-semibold text-sm">{{ product.brand?.name }}</span>
        </div>

        <!-- Product Name -->
        <div>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--color-foreground)] leading-tight">
                {{ product.name }}
            </h1>
        </div>

        <!-- Product Stats -->
        <div class="flex flex-wrap items-center gap-4 pb-4 border-b border-[var(--color-border)]">
            <div class="flex items-center gap-1">
                <i class="pi pi-shopping-bag text-[var(--color-primary)] text-sm"></i>
                <span class="text-xs text-[var(--color-foreground)]">Đã bán <span class="font-semibold">{{ product.sold }}</span></span>
            </div>
            <div class="flex items-center gap-1">
                <i class="pi pi-comment text-[var(--color-primary)] text-sm"></i>
                <span class="text-xs text-[var(--color-foreground)]"><span class="font-semibold">20</span> đánh giá</span>
            </div>
            <div class="flex items-center gap-1">
                <i class="pi pi-star-fill text-[var(--color-secondary)] text-sm"></i>
                <span class="text-xs text-[var(--color-foreground)]"><span class="font-semibold">4.5</span> / 5</span>
            </div>
        </div>

        <!-- Price Section -->
        <div class="price-panel p-5 rounded-xl border-2">
            <div class="flex items-end gap-4 mb-2">
                <span class="text-3xl md:text-4xl font-bold text-[var(--color-destructive)]">
                    {{ formatPrice(discountedPrice) }}
                </span>
                <span class="text-lg text-[var(--color-muted-foreground)] line-through mb-1">
                    {{ formatPrice(product.price) }}
                </span>
            </div>
            <div class="flex items-center gap-3">
                <span class="bg-[var(--color-destructive)] text-[var(--color-on-destructive)] px-2 py-0.5 rounded-full text-xs font-bold">
                    -{{ product.discount }}%
                </span>
                <span class="text-[var(--color-muted-foreground)] text-xs">
                    Tiết kiệm <span class="font-bold text-[var(--color-destructive)]">{{ formatPrice(discountAmount) }}đ</span>
                </span>
            </div>
        </div>

        <!-- Stock Status -->
        <div class="stock-panel flex items-center gap-2 p-3 rounded-lg border">
            <i class="pi pi-check-circle text-[var(--color-accent)] text-lg"></i>
            <div>
                <p class="font-semibold text-[var(--color-foreground)] text-sm">Còn {{ product.amount }} sản phẩm</p>
                <p class="text-xs text-[var(--color-muted-foreground)]">Giao hàng nhanh trong 2h</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { IGetBrandResponse } from '@/api/models/brand';
import { computed } from 'vue';

const props = defineProps<{
    product: {
        id: number
        name: string
        slug: string
        description: string
        imageUrl: string[]
        price: number
        discount: number
        amount: number
        sold: number
        sale: boolean
        brand: IGetBrandResponse,
        createdAt: string
        updatedAt: string
    };
}>();

const discountAmount = computed(() => {
    return (props.product.price * props.product.discount) / 100;
});

const discountedPrice = computed(() => {
    return props.product.price - discountAmount.value;
});

function formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price);
}
</script>

<style scoped>
.price-panel {
    background: color-mix(in srgb, var(--color-destructive) 8%, var(--color-card));
    border-color: color-mix(in srgb, var(--color-destructive) 20%, var(--color-card));
}

.stock-panel {
    background: color-mix(in srgb, var(--color-accent) 8%, var(--color-card));
    border-color: color-mix(in srgb, var(--color-accent) 25%, var(--color-card));
}
</style>