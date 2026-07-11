<template>
  <div class="banner-wrapper">
    <div class="banner-container">
      <!-- Main Carousel -->
      <div class="carousel-main">
        <a-carousel arrows class="main-carousel" autoplay :autoplay-speed="3000">
          <div class="carousel-slide" v-for="(image, index) in mainBanners" :key="index">
            <img loading="lazy" :src="image" :alt="`Banner ${index + 1}`" />
          </div>
        </a-carousel>

        <!-- Overlay content (optional) -->
        <div class="carousel-overlay">
          <div class="overlay-content">
            <h2>Chuyên cung cấp thuốc & vitamin chính hãng</h2>
            <p>Giao hàng siêu tốc • Giá tốt nhất thị trường</p>
            <button class="overlay-btn">Khám phá ngay</button>
          </div>
        </div>
      </div>

      <!-- Side Banners -->
      <div class="side-banners">
        <div class="side-banner banner-1" v-for="(image, index) in sideBanners" :key="index">
          <img loading="lazy" :src="image" :alt="`Khuyến mãi ${index + 1}`" />
          <div class="banner-label">{{ index === 0 ? 'Khuyến mãi' : 'Ưu đãi' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons-vue'
import { getCloudinaryImageUrl } from '@/utils/cloudinary'
import { BANNER_PUBLIC_IDS } from '@/config/assetConfig'

const bannerPublicIds = BANNER_PUBLIC_IDS

const mainBanners = computed(() => {
  const cloudinaryBanners = bannerPublicIds.slice(0, 3).map((publicId) =>
    getCloudinaryImageUrl(publicId),
  )
  return [...cloudinaryBanners].slice(0, 3)
})

const sideBanners = computed(() => {
  const cloudinarySide = bannerPublicIds.slice(3, 5).map((publicId) =>
    getCloudinaryImageUrl(publicId),
  )
  return [...cloudinarySide].slice(0, 2)
})

</script>

<style scoped>
:root {
  --primary: #8b5cf6;
  --primary-dark: #7c3aed;
}

/* Wrapper */
.banner-wrapper {
  width: 100%;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.02) 0%, rgba(255, 255, 255, 0) 100%);
  padding: 12px 0;
}

/* Container */
.banner-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 16px;
}

/* Main Carousel */
.carousel-main {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  /* Height = 2 side banners + gap: 280px * 2 + 16px = 576px */
  height: 576px;
  box-shadow: 0 12px 32px rgba(139, 92, 246, 0.08);
}

.main-carousel {
  height: 100%;
  width: 100%;
}

.carousel-slide {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f3f4f6;
}

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Overlay content */
.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent);
  display: flex;
  align-items: flex-end;
  padding: 24px;
  z-index: 2;
}

.overlay-content {
  color: white;
}

.overlay-content h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.overlay-content p {
  font-size: 0.95rem;
  margin-bottom: 16px;
  opacity: 0.95;
}

.overlay-btn {
  background: linear-gradient(90deg, var(--primary), var(--primary-dark));
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.overlay-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
}

/* Carousel Arrows */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  font-size: 24px;
}

.carousel-arrow:hover {
  background: rgba(139, 92, 246, 0.3);
  transform: translateY(-50%) scale(1.1);
}

.prev-arrow {
  left: 16px;
}

.next-arrow {
  right: 16px;
}

/* Side Banners */
.side-banners {
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* Total height = (576px - 16px) / 2 = 280px each */
}

.side-banner {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  height: 280px;
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
}

.side-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.side-banner:hover img {
  transform: scale(1.08);
}

.banner-label {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--primary);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive */
@media (max-width: 1024px) {
  .banner-container {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .side-banners {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .carousel-main {
    height: auto;
    aspect-ratio: 2 / 1;
  }

  .side-banner {
    height: auto;
    aspect-ratio: 1 / 1;
  }

  .overlay-content h2 {
    font-size: 1.25rem;
  }
}

@media (max-width: 640px) {
  .banner-container {
    padding: 0 8px;
    gap: 8px;
  }

  .carousel-main {
    aspect-ratio: 1 / 1;
    border-radius: 12px;
  }

  .carousel-arrow {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .overlay-content h2 {
    font-size: 1rem;
  }

  .overlay-content p {
    font-size: 0.85rem;
  }

  .overlay-btn {
    padding: 8px 16px;
    font-size: 0.9rem;
  }

  .side-banners {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .side-banner {
    height: auto;
  }
}
</style>
