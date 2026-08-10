<template>
    <section class="product-category-section py-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <div>
                    <h4 :class="['title', { 'title-flash': isFlashSale }]">{{ saleHeader.title }}</h4>
                    <p :class="['subtitle', { 'subtitle-flash': isFlashSale }]">{{ saleHeader.subtitle }}</p>
                    <div v-if="isFlashSale" class="countdown-badge">
                        <span class="countdown-dot"></span>
                        <span>Chỉ còn {{ saleCountdown }}</span>
                    </div>
                </div>
            </div>

            <!-- Carousel -->
            <div class="carousel-wrap">
                <Carousel class="category-carousel" :value="props.data" :numVisible="numVisible" :numScroll="numScroll"
                    :responsiveOptions="responsiveOptions">
                    <template #item="slotProps">
                        <div class="carousel-item">
                            <ProductCard :data="slotProps.data" />
                        </div>
                    </template>
                </Carousel>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import Carousel from 'primevue/carousel';
import ProductCard from '@/components/ProductCard/ProductCard.vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { IGetProductResponse } from '@/api/models/product';

const props = defineProps<{
    data: IGetProductResponse[];
}>();

const now = ref(Date.now());
let timerId: ReturnType<typeof setInterval> | null = null;

const updateNow = () => {
    now.value = Date.now();
};

onMounted(() => {
    updateNow();
    timerId = setInterval(updateNow, 1000);
});

onUnmounted(() => {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
});

const saleProducts = computed(() => {
    return (props.data ?? []).filter(
        (item) => item.isSale && item.discount > 0 && item.saleEndTime,
    );
});

const nearestSaleEndAt = computed(() => {
    const dates = saleProducts.value
        .map((item) => Date.parse(item.saleEndTime))
        .filter((timestamp) => !Number.isNaN(timestamp) && timestamp > now.value);
    return dates.length ? Math.min(...dates) : 0;
});

const remainingMs = computed(() => Math.max(0, nearestSaleEndAt.value - now.value));

const saleCountdown = computed(() => {
    if (!nearestSaleEndAt.value || remainingMs.value <= 0) return '00:00:00';
    const totalSeconds = Math.floor(remainingMs.value / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    if (days > 0) {
        return `${days} ngày ${hours}:${minutes}:${seconds}`;
    }
    return `${hours}:${minutes}:${seconds}`;
});

const isFlashSale = computed(() => {
    return saleProducts.value.length > 0 && nearestSaleEndAt.value > now.value;
});

const saleHeader = computed(() => {
    if (!isFlashSale.value) {
        return {
            title: 'Danh mục nổi bật',
            subtitle: 'Các sản phẩm được chọn lọc — chất lượng & uy tín',
        };
    }
    return {
        title: 'FLASH SALE',
        subtitle: 'Ưu đãi hot, chỉ còn trong thời gian ngắn',
    };
});

const numVisible = 5;
const numScroll = 3;
const responsiveOptions = [
    {
        breakpoint: '1400px',
        numVisible: 5,
        numScroll: 2,
    },
    {
        breakpoint: '1024px',
        numVisible: 4,
        numScroll: 2,
    },
    {
        breakpoint: '768px',
        numVisible: 3,
        numScroll: 1,
    },
    {
        breakpoint: '640px',
        numVisible: 2,
        numScroll: 1,
    },
    {
        breakpoint: '480px',
        numVisible: 1,
        numScroll: 1,
    },
];
</script>

<style scoped>
:root {
    --primary: #8b5cf6;
    --primary-dark: #7c3aed;
    --muted: #6b7280;
    --card-border: #efe6ff;
}

/* Section background subtle */
.product-category-section {
    background: radial-gradient(circle at top left, rgba(251, 146, 60, 0.18), transparent 28%),
        linear-gradient(180deg, #fff7ed 0%, #fff1e0 48%, #ffffff 100%);
    padding-top: 1.25rem;
    padding-bottom: 1.25rem;
    border-radius: 1.5rem;
    border: 1px solid rgba(251, 146, 60, 0.18);
}

/* Header */
.title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--primary-dark);
    margin: 0;
}

.title-flash {
    background: linear-gradient(90deg, #f97316, #ef4444, #facc15);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-shadow: 0 4px 18px rgba(239, 68, 68, 0.2);
}

.subtitle {
    margin: 4px 0 0;
    color: var(--muted);
    font-size: 0.875rem;
}

.subtitle-flash {
    color: #f97316;
    font-weight: 700;
}

.countdown-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    background: linear-gradient(90deg, #f97316 0%, #ef4444 45%, #facc15 100%);
    color: #fff;
    font-size: 0.92rem;
    font-weight: 700;
    padding: 0.75rem 1.15rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 12px 30px rgba(239, 68, 68, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.12);
    animation: pulse-glow 1.8s ease-in-out infinite;
}

.countdown-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.18);
}

@keyframes pulse-glow {

    0%,
    100% {
        transform: scale(1);
        box-shadow: 0 12px 30px rgba(239, 68, 68, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.12);
    }

    50% {
        transform: scale(1.02);
        box-shadow: 0 16px 36px rgba(239, 68, 68, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.18);
    }
}

/* View more link styled as subtle pill */
.view-more {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(139, 92, 246, 0.08), rgba(167, 139, 250, 0.04));
    color: var(--primary-dark);
    font-weight: 600;
    text-decoration: none;
    border: 1px solid rgba(139, 92, 246, 0.08);
    transition: all .18s ease;
}

.view-more:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(139, 92, 246, 0.08);
}

/* Carousel adjustments */
.carousel-wrap {
    position: relative;
}

/* PrimeVue carousel item wrapper override */
.category-carousel :deep(.p-carousel) {
    padding-bottom: 0;
}

.category-carousel :deep(.p-carousel-viewport) {
    padding: 6px 0;
}

.category-carousel :deep(.p-carousel-item) {
    display: flex;
    align-items: stretch;
    justify-content: center;
    padding: 8px;
    box-sizing: border-box;
}

/* Make each carousel item card constrained and centered */
.carousel-item {
    width: 100%;
    max-width: 280px;
    display: flex;
    align-items: stretch;
    justify-content: center;
}

/* Subtle focus/hover effect on product card wrapper */
.carousel-item :deep(.group) {
    transition: transform .25s ease, box-shadow .25s ease;
}

.carousel-item :deep(.group):hover {
    transform: translateY(-6px);
    box-shadow: 0 10px 30px rgba(139, 92, 246, 0.08);
}

/* Responsive spacing tweaks */
@media (max-width: 1024px) {
    .carousel-item {
        max-width: 220px;
    }
}

@media (max-width: 640px) {
    .title {
        font-size: 1rem;
    }

    .subtitle {
        font-size: 0.8rem;
    }

    .carousel-item {
        max-width: 180px;
    }
}

/* keep existing line-clamp utility */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
