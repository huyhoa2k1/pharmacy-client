<template>
    <div>
        <Swiper :effect="'cards'" :grabCursor="true" :modules="modules" class="mySwiper"
            :initial-slide="activeIndex" @swiper="onSwiper" @slideChange="onSlideChange">
            <SwiperSlide v-for="(img, idx) in images" :key="idx">
                <img :src="img" alt="" />
            </SwiperSlide>
        </Swiper>
        <!-- Thumbnails -->
        <div class="thumb-list">
            <button v-for="(img, idx) in images" :key="idx" type="button" @click="goToSlide(idx)"
                :class="['thumb', { active: idx === activeIndex }]">
                <img :src="img" alt="" />
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/effect-cards';
import { EffectCards } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper';
import { ref } from 'vue';

const modules = [EffectCards];
const swiperInstance = ref<SwiperInstance | null>(null);
const activeIndex = ref(0);

const props = defineProps<{
    images: string[]
}>();

function goToSlide(idx: number) {
    activeIndex.value = idx;
    swiperInstance.value?.slideTo(idx);
}

function onSwiper(swiper: SwiperInstance) {
    swiperInstance.value = swiper;
}

function onSlideChange(swiper: SwiperInstance) {
    activeIndex.value = swiper.activeIndex;
}
</script>

<style scoped>
.swiper {
    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;
    background: linear-gradient(135deg, var(--color-card) 0%, var(--color-muted) 100%);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.swiper-slide {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-card);
    border-radius: 12px;
}

.swiper-slide img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 16px;
}

/* Thumbnails */
.thumb-list {
    display: flex;
    justify-content: flex-start;
    gap: 8px;
    margin-top: 12px;
    overflow-x: auto;
    padding-bottom: 4px;
}

.thumb {
    border: 2px solid var(--color-border);
    border-radius: 8px;
    padding: 0;
    background: var(--color-card);
    cursor: pointer;
    transition: all 0.3s ease;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
}

.thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.thumb:hover {
    border-color: var(--color-primary);
    box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 20%, transparent);
}

.thumb.active {
    border-color: var(--color-primary);
    box-shadow: 0 0 12px color-mix(in srgb, var(--color-primary) 40%, transparent);
    background: var(--color-muted);
}

/* Scrollbar */
.thumb-list::-webkit-scrollbar {
    height: 4px;
}

.thumb-list::-webkit-scrollbar-track {
    background: var(--color-muted);
    border-radius: 4px;
}

.thumb-list::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;
}

.thumb-list::-webkit-scrollbar-thumb:hover {
    background: var(--color-primary);
}
</style>