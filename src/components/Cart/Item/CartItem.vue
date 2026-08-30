<template>
    <div
        class="grid items-start justify-start gap-2 py-4 md:gap-4 md:p-0 md:grid-cols-[calc(16rem/16)_1fr_calc(24rem/16)] grid-cols-[calc(16rem/16)_1fr]">
        <a-checkbox :checked="checked" @change="onToggle" />
        <div class="grid grid-cols-[calc(68rem/16)_1fr] items-start gap-2">
            <div class="relative h-[calc(68rem/16)] w-[calc(68rem/16)] rounded-sm border border-neutral-100">
                <a :href="link">
                    <img class="object-fit" :src="image" alt="" loading="lazy" width="500" height="500"
                        sizes="(min-width: 769px) 129px, 96px">
                </a>
            </div>
            <div class="flex h-full flex-col justify-between md:flex-row md:space-x-4">
                <div>
                    <a :href="link">
                        <p class="line-clamp-3 text-sm font-semibold text-neutral-900">{{ name }}</p>
                    </a>
                </div>
                <div class="flex h-fit items-center justify-between space-x-4 md:justify-center">
                    <div class="flex flex-col justify-center md:w-[calc(160rem/16)] md:flex-row md:space-x-1">
                        <p class="text-base font-semibold md:text-sm text-neutral-900">{{ formatPrice(props.price) }}
                        </p>
                    </div>
                    <div
                        class="flex w-[calc(117rem/16)] items-center justify-end self-end md:justify-center md:self-center">
                        <div>
                            <a-popconfirm v-if="props.quantity === 1" title="Bạn có muốn xóa sản phẩm này không?"
                                ok-text="Xóa" cancel-text="Hủy" @confirm="onDelete" @cancel="onCancel">
                                <button class="rounded-full bg-[hsl(0,0%,82%)] w-6 h-6 cursor-pointer">
                                    <MinusOutlined class="text-xs" />
                                </button>
                            </a-popconfirm>
                            <button v-else class="rounded-full bg-[hsl(0,0%,82%)] w-6 h-6 cursor-pointer"
                                @click="decrease">
                                <MinusOutlined class="text-xs" />
                            </button>
                            <a-popconfirm v-if="showConfirm" title="Bạn có muốn xóa sản phẩm này không?" ok-text="Xóa"
                                cancel-text="Hủy" @confirm="onDelete" @cancel="onCancel">
                                <template #default>
                                    <button style="display:none"></button>
                                </template>
                            </a-popconfirm>
                            <input type="text" class="w-12 text-center" :value="quantity" readonly>
                            <button class="rounded-full bg-[hsl(0,0%,82%)] w-6 h-6 cursor-pointer" @click="increase">
                                <PlusOutlined class="text-xs" />
                            </button>
                        </div>
                    </div>
                    <div class="hidden w-[calc(120rem/16)] items-center justify-end md:flex">
                        <p class="text-base font-semibold md:text-sm text-neutral-900">{{ formatPrice(props.total) }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <a-popconfirm title="Are you sure delete this product?" ok-text="Yes" cancel-text="No" @confirm="onDelete"
            @cancel="onCancel">
            <a-button type="text" class="cart-delete-button" aria-label="Xóa sản phẩm">
                <i class="pi pi-trash"></i>
            </a-button>
        </a-popconfirm>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons-vue';
import { formatPrice } from '@/utils/format';

const props = defineProps<{
    checked: boolean;
    name: string;
    image: string;
    link: string;
    price: number;
    quantity: number;
    total: number;
}>();

const emit = defineEmits(['toggle', 'increase', 'decrease', 'delete', 'cancel']);

const showConfirm = ref(false);

function onToggle() {
    emit('toggle');
}
function increase() {
    emit('increase');
}
function decrease() {
    if (props.quantity > 1) {
        emit('decrease');
    } else {
        showConfirm.value = true;
    }
}
function onDelete() {
    emit('delete');
    showConfirm.value = false;
}
function onCancel() {
    emit('cancel');
    showConfirm.value = false;
}
</script>

<style scoped>
.cart-delete-button {
    color: var(--color-destructive);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: color var(--transition-base), background-color var(--transition-base);
}

.cart-delete-button:hover {
    color: var(--color-destructive) !important;
    background-color: color-mix(in srgb, var(--color-destructive) 10%, transparent) !important;
}

.cart-delete-button:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--color-ring) 35%, transparent);
    outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
    .cart-delete-button {
        transition: none;
    }
}
</style>