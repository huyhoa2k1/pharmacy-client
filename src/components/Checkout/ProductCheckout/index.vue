<template>
    <div class="flex items-center gap-4 py-3 border-b border-gray-100">
        <div
            class="w-17 h-17 rounded-lg border border-gray-200 bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
            <a :href="link">
                <img :src="image" alt="" loading="lazy" :srcset="srcset" class="w-full h-full object-cover" />
            </a>
        </div>
        <div class="flex-1 flex items-center gap-3 min-w-0">
            <a-tooltip :title="name" placement="top">
                <a :href="link" class="product-name">
                    {{ name }}
                </a>
            </a-tooltip>
            <span class="quantity-badge">
                x{{ quantity }}
            </span>
            <span class="total-price">
                {{ total }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Tooltip as ATooltip } from 'ant-design-vue';

const props = defineProps<{
    name: string;
    image: string;
    link: string;
    price: string;
    quantity: number;
    total: string;
    srcset?: string;
}>();
</script>

<style scoped>
/* Product name with ellipsis */
.product-name {
    flex: 1;
    min-width: 0;
    font-weight: 600;
    font-size: 14px;
    color: var(--color-foreground);
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color var(--transition-base);
}

.product-name:hover {
    color: var(--color-primary);
}

.product-name:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--color-ring) 35%, transparent);
    outline-offset: 2px;
}

/* Quantity badge */
.quantity-badge {
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-muted-foreground);
    white-space: nowrap;
    padding: 2px 8px;
    background: var(--color-muted);
    border-radius: var(--radius-sm);
}

/* Total price */
.total-price {
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 700;
    color: var(--color-destructive);
    white-space: nowrap;
    text-align: right;
    min-width: 80px;
}

@media (prefers-reduced-motion: reduce) {
    .product-name {
        transition: none;
    }
}

/* Tooltip styling */
:deep(.ant-tooltip-inner) {
    background: #1f2937;
    color: #fff;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
}

:deep(.ant-tooltip-arrow-content) {
    background-color: #1f2937;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .product-name {
        font-size: 13px;
    }

    .quantity-badge {
        font-size: 12px;
        padding: 2px 6px;
    }

    .total-price {
        font-size: 12px;
        min-width: 70px;
    }
}

@media (max-width: 480px) {
    .product-name {
        font-size: 12px;
    }

    .quantity-badge {
        display: none;
    }

    .total-price {
        font-size: 11px;
        min-width: 60px;
    }
}
</style>