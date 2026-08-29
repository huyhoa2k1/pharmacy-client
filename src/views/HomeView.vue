<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { IGetProductResponse } from '@/api/models/product'
import { ProductService } from '@/api/services/product'
import type { IGetCategoryResponse } from '@/api/models/category'
import { CategoryService } from '@/api/services/category'
import ProductCard from '@/components/ProductCard/ProductCard.vue'
import Carousel from 'primevue/carousel'
import { debounce } from 'lodash'

const router = useRouter()
const saleProducts = ref<IGetProductResponse[]>([])
const bestSellers = ref<IGetProductResponse[]>([])
const categories = ref<IGetCategoryResponse[]>([])
const searchTerm = ref('')
const searchResults = ref<IGetProductResponse[]>([])
const isSearching = ref(false)
const isLoadingProducts = ref(true)
const isLoadingCategories = ref(true)
const productsError = ref('')
const categoriesError = ref('')
const saleNow = ref(Date.now())
const searchPlaceholderSuggestions = [
  'Tìm thuốc, vitamin, sản phẩm chăm sóc sức khỏe...',
  'Tìm thuốc cảm, đau đầu...',
  'Tìm vitamin và thực phẩm bổ sung...',
  'Tìm sản phẩm chăm sóc da...',
]
const animatedSearchPlaceholder = ref('')
let saleTimerId: ReturnType<typeof setInterval> | undefined
let placeholderAnimationTimerId: ReturnType<typeof setTimeout> | undefined
let placeholderSuggestionIndex = 0
let placeholderCharacterIndex = 0
let isDeletingPlaceholder = false

const categoryIcons = ['pi-heart', 'pi-sparkles', 'pi-sun', 'pi-users', 'pi-plus-circle', 'pi-home']
const carouselResponsiveOptions = [
  { breakpoint: '1200px', numVisible: 3, numScroll: 1 },
  { breakpoint: '768px', numVisible: 2, numScroll: 1 },
  { breakpoint: '576px', numVisible: 1, numScroll: 1 },
]
const heroPromotions = [
  {
    image:
      'https://production-cdn.pharmacity.io/digital/1590x0/plain/e-com/images/banners/20260131173232-0-hen.png?versionId=NH2BO4kn.nEaKeq4MxOqa2xoqdyuubR7',
    alt: 'Ưu đãi chăm sóc sức khỏe',
  },
  {
    image:
      'https://production-cdn.pharmacity.io/digital/1590x0/plain/e-com/images/banners/20260723075253-0-592_254-hero.jpg?versionId=esUJ2VFBPscRAM5QUe4ggCPiFuklQmEX',
    alt: 'Khuyến mãi sản phẩm chăm sóc sức khỏe',
  },
  {
    image:
      'https://production-cdn.pharmacity.io/digital/1590x0/plain/e-com/images/banners/20260813093633-0-1184x508.png?versionId=wo2fTjTd7696vv8jyJyXbAjILbyc8wIQ',
    alt: 'Ưu đãi sản phẩm cho gia đình',
  },
  {
    image:
      'https://production-cdn.pharmacity.io/digital/1590x0/plain/e-com/images/banners/20260818085806-0-Bw.png?versionId=FbNAOyazW.1EQtZij7SBLz6wEApRj_hZ',
    alt: 'Chương trình ưu đãi Pharmacy',
  },
]
const heroPromotionResponsiveOptions = [
  { breakpoint: '768px', numVisible: 1, numScroll: 1 },
  { breakpoint: '576px', numVisible: 1, numScroll: 1 },
]

const visibleCategories = computed(() => categories.value.slice(0, 6))
const saleEndAt = computed(() => {
  const saleEndTimes = saleProducts.value
    .map((product) => Date.parse(product.saleEndTime))
    .filter((time) => !Number.isNaN(time) && time > saleNow.value)

  return saleEndTimes.length ? Math.min(...saleEndTimes) : 0
})
const saleCountdown = computed(() => {
  const remainingSeconds = Math.max(0, Math.floor((saleEndAt.value - saleNow.value) / 1000))
  const hours = Math.floor(remainingSeconds / 3600)
  const minutes = Math.floor((remainingSeconds % 3600) / 60)
  const seconds = remainingSeconds % 60

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0'))
})

const getProducts = async () => {
  isLoadingProducts.value = true
  productsError.value = ''
  try {
    const [saleResponse, bestSellerResponse] = await Promise.all([
      ProductService.getProductsOnSale(),
      ProductService.getBestSellingProducts(5),
    ])
    saleProducts.value = saleResponse
    bestSellers.value = bestSellerResponse
  } catch {
    productsError.value = 'Không thể tải sản phẩm. Vui lòng thử lại.'
  } finally {
    isLoadingProducts.value = false
  }
}

const getCategories = async () => {
  isLoadingCategories.value = true
  categoriesError.value = ''
  try {
    categories.value = await CategoryService.getAllCategories()
  } catch {
    categoriesError.value = 'Không thể tải danh mục. Vui lòng thử lại.'
  } finally {
    isLoadingCategories.value = false
  }
}

const searchProducts = debounce(async (keyword: string) => {
  const trimmedKeyword = keyword.trim()
  if (!trimmedKeyword) {
    searchResults.value = []
    isSearching.value = false
    return
  }

  isSearching.value = true
  try {
    searchResults.value = (await ProductService.searchProducts(trimmedKeyword)).slice(0, 5)
  } catch {
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}, 300)

const handleSearchInput = () => {
  searchProducts(searchTerm.value)
}

const openProduct = (product: IGetProductResponse) => {
  searchTerm.value = ''
  searchResults.value = []
  router.push({
    name: 'product-detail',
    params: {
      categoryId: product.brand.categoryId,
      id: product.id,
    },
  })
}

const submitSearch = () => {
  if (searchResults.value[0]) {
    openProduct(searchResults.value[0])
  }
}

const animateSearchPlaceholder = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animatedSearchPlaceholder.value = searchPlaceholderSuggestions[0]
    return
  }

  const suggestion = searchPlaceholderSuggestions[placeholderSuggestionIndex]
  let delay = isDeletingPlaceholder ? 35 : 65

  if (isDeletingPlaceholder) {
    placeholderCharacterIndex -= 1
    animatedSearchPlaceholder.value = suggestion.slice(0, placeholderCharacterIndex)

    if (placeholderCharacterIndex === 0) {
      isDeletingPlaceholder = false
      placeholderSuggestionIndex = (placeholderSuggestionIndex + 1) % searchPlaceholderSuggestions.length
      delay = 450
    }
  } else {
    placeholderCharacterIndex += 1
    animatedSearchPlaceholder.value = suggestion.slice(0, placeholderCharacterIndex)

    if (placeholderCharacterIndex === suggestion.length) {
      isDeletingPlaceholder = true
      delay = 1600
    }
  }

  placeholderAnimationTimerId = setTimeout(animateSearchPlaceholder, delay)
}

onMounted(() => {
  getProducts()
  getCategories()
  animateSearchPlaceholder()
  saleTimerId = setInterval(() => {
    saleNow.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (saleTimerId) clearInterval(saleTimerId)
  if (placeholderAnimationTimerId) clearTimeout(placeholderAnimationTimerId)
})
</script>

<template>
  <main class="homepage">
    <section class="hero" aria-label="Khuyến mãi và tìm kiếm sản phẩm">
      <div class="hero__masthead"></div>

      <div class="hero__search-panel">
        <form class="hero__search" role="search" @submit.prevent="submitSearch">
          <label class="sr-only" for="medicine-search">Tìm thuốc, vitamin hoặc sản phẩm chăm sóc sức khỏe</label>
          <i class="pi pi-search hero__search-icon" aria-hidden="true"></i>
          <input id="medicine-search" v-model="searchTerm" class="hero__search-input" type="search" autocomplete="off"
            :placeholder="animatedSearchPlaceholder" :aria-expanded="searchResults.length > 0"
            aria-controls="medicine-search-results" @input="handleSearchInput" />
          <span v-if="isSearching" class="hero__search-status" role="status">Đang tìm</span>
          <button class="btn-primary hero__search-button" type="submit">Tìm sản phẩm</button>

          <ul v-if="searchResults.length" id="medicine-search-results" class="hero__search-results" role="listbox"
            aria-label="Kết quả tìm kiếm">
            <li v-for="product in searchResults" :key="product.id" role="option">
              <button type="button" @click="openProduct(product)">
                <img v-if="product.imageUrl[0]" :src="product.imageUrl[0]" :alt="''" />
                <i v-else class="pi pi-image" aria-hidden="true"></i>
                <span>
                  <strong>{{ product.name }}</strong>
                  <small>{{ new Intl.NumberFormat('vi-VN').format(product.price) }} đ</small>
                </span>
              </button>
            </li>
          </ul>
        </form>

        <div class="hero__popular-searches" aria-label="Tìm kiếm phổ biến">
          <span>Gợi ý:</span>
          <a href="#recommendations">Vitamin</a>
          <a href="#recommendations">Khẩu trang</a>
          <a href="#recommendations">Chăm sóc da</a>
          <a href="#recommendations">Sữa dinh dưỡng</a>
        </div>
      </div>

      <div class="hero__services" aria-label="Dịch vụ Pharmacy">
        <a href="#recommendations">
          <i class="pi pi-comments" aria-hidden="true"></i>
          <span><strong>Tư vấn cùng dược sĩ</strong><small>Hỗ trợ tận tâm mỗi ngày</small></span>
          <i class="pi pi-angle-right" aria-hidden="true"></i>
        </a>
        <a href="#categories">
          <i class="pi pi-map-marker" aria-hidden="true"></i>
          <span><strong>Tìm nhà thuốc gần bạn</strong><small>Thuận tiện mua sắm và nhận hàng</small></span>
          <i class="pi pi-angle-right" aria-hidden="true"></i>
        </a>
      </div>

      <Carousel class="hero__promotions" :value="heroPromotions" :num-visible="2" :num-scroll="1"
        :responsive-options="heroPromotionResponsiveOptions" :show-indicators="false">
        <template #item="slotProps">
          <a class="hero__promotion-card" href="#recommendations">
            <img :src="slotProps.data.image" :alt="slotProps.data.alt" />
          </a>
        </template>
      </Carousel>
    </section>

    <section id="categories" class="homepage__section" aria-labelledby="categories-heading">
      <div class="section-heading">
        <div>
          <p class="section-heading__eyebrow">Khám phá theo nhu cầu</p>
          <h2 id="categories-heading">Danh mục sức khỏe</h2>
        </div>
      </div>

      <div v-if="isLoadingCategories" class="state-card" role="status">Đang tải danh mục...</div>
      <div v-else-if="categoriesError" class="state-card state-card--error" role="alert">
        <p>{{ categoriesError }}</p>
        <button class="btn-secondary" type="button" @click="getCategories">Thử lại</button>
      </div>
      <p v-else-if="visibleCategories.length === 0" class="state-card">
        Chưa có danh mục để hiển thị.
      </p>
      <div v-else class="category-grid">
        <router-link v-for="(category, index) in visibleCategories" :key="category.id"
          :to="{ name: 'products', params: { categoryId: category.id } }" class="category-card">
          <span class="category-card__icon" aria-hidden="true">
            <i :class="['pi', categoryIcons[index % categoryIcons.length]]"></i>
          </span>
          <span>{{ category.name }}</span>
          <i class="pi pi-arrow-right category-card__arrow" aria-hidden="true"></i>
        </router-link>
      </div>
    </section>

    <section id="recommendations" class="homepage__section" aria-labelledby="sale-heading">
      <div class="flash-sale">
        <img class="flash-sale__banner"
          src="https://prod-cdn.pharmacity.io/e-com/images/flashsale/20260805020324-0-Home_Flashsale_web.png?versionId=qcHQ6.0JKKgkZNotOyzH659ni7BfmvOf"
          alt="Ưu đãi Flash Sale" />

        <div class="flash-sale__content">
          <div class="flash-sale__heading">
            <div>
              <p class="flash-sale__eyebrow">Ưu đãi trong ngày</p>
              <h2 id="sale-heading">Flash Sale</h2>
            </div>
            <div class="flash-sale__timer" aria-live="polite" aria-label="Thời gian còn lại">
              <span class="flash-sale__timer-label">Kết thúc sau</span>
              <span v-for="(unit, index) in saleCountdown" :key="['giờ', 'phút', 'giây'][index]"
                class="flash-sale__time-unit">
                <strong>{{ unit }}</strong>
                <small>{{ ['Giờ', 'Phút', 'Giây'][index] }}</small>
              </span>
            </div>
            <a class="flash-sale__all-link" href="#best-sellers-heading">
              Xem tất cả <i class="pi pi-arrow-right" aria-hidden="true"></i>
            </a>
          </div>

          <div class="flash-sale__categories" aria-label="Nhóm ưu đãi">
            <span>Chăm sóc tiêu hóa</span>
            <span>Sức khỏe đôi mắt</span>
            <span>Tăng cường đề kháng</span>
          </div>

          <div v-if="isLoadingProducts" class="flash-sale__products product-grid--loading" aria-busy="true">
            <div v-for="item in 4" :key="item" class="product-skeleton" aria-hidden="true"></div>
          </div>
          <div v-else-if="productsError" class="state-card state-card--error" role="alert">
            <p>{{ productsError }}</p>
            <button class="btn-secondary" type="button" @click="getProducts">Thử lại</button>
          </div>
          <p v-else-if="saleProducts.length === 0" class="state-card">
            Hiện chưa có sản phẩm giảm giá.
          </p>
          <Carousel v-else class="product-carousel product-carousel--flash-sale" :value="saleProducts" :num-visible="4"
            :num-scroll="1" :responsive-options="carouselResponsiveOptions" :show-indicators="false">
            <template #item="slotProps">
              <div class="product-carousel__item">
                <ProductCard :data="slotProps.data" />
              </div>
            </template>
          </Carousel>
        </div>
      </div>
    </section>

    <section class="homepage__section" aria-labelledby="best-sellers-heading">
      <div class="section-heading section-heading--with-action">
        <div>
          <p class="section-heading__eyebrow">Được nhiều khách hàng lựa chọn</p>
          <h2 id="best-sellers-heading">Sản phẩm bán chạy</h2>
        </div>
        <router-link class="section-heading__link" :to="{ name: 'best-sellers' }">
          Xem tất cả <i class="pi pi-arrow-right" aria-hidden="true"></i>
        </router-link>
      </div>

      <div v-if="isLoadingProducts" class="product-grid product-grid--loading" aria-busy="true">
        <div v-for="item in 4" :key="item" class="product-skeleton" aria-hidden="true"></div>
      </div>
      <div v-else-if="productsError" class="state-card state-card--error" role="alert">
        <p>{{ productsError }}</p>
        <button class="btn-secondary" type="button" @click="getProducts">Thử lại</button>
      </div>
      <p v-else-if="bestSellers.length === 0" class="state-card">
        Chưa có sản phẩm bán chạy phù hợp.
      </p>
      <Carousel v-else class="product-carousel" :value="bestSellers" :num-visible="4" :num-scroll="1"
        :responsive-options="carouselResponsiveOptions" :show-indicators="false">
        <template #item="slotProps">
          <div class="product-carousel__item">
            <ProductCard :data="slotProps.data" />
          </div>
        </template>
      </Carousel>
    </section>
  </main>
</template>

<style scoped>
.homepage {
  display: flex;
  flex-direction: column;
  gap: var(--space-3xl);
  padding-bottom: var(--space-2xl);
}

.hero {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-background);
  box-shadow: var(--shadow-md);
}

.hero__masthead {
  position: absolute;
  inset: 0 0 auto;
  min-height: clamp(260px, 28vw, 365px);
  background: url('https://prod-cdn.pharmacity.io/e-com/images/banners/20260731041315-0-imaget8.png?versionId=uX2n4Zbnx9m_oAMvbi3qjabhH8op4PJX') center / cover no-repeat;
}

.section-heading__eyebrow {
  margin: 0 0 var(--space-sm);
  color: #0e7490;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.hero__search-panel {
  position: relative;
  z-index: 2;
  width: min(100% - clamp(var(--space-md), 7vw, 8rem), 52rem);
  margin: clamp(190px, 22vw, 290px) auto 0;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card);
  box-shadow: var(--shadow-lg);
}

.hero__search {
  position: relative;
  display: flex;
  min-height: 56px;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card);
  box-shadow: var(--shadow-sm);
}

.hero__search:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px #0891b220;
}

.hero__search-icon {
  margin-left: var(--space-md);
  color: var(--color-primary);
}

.hero__search-input {
  width: 100%;
  min-width: 0;
  padding: var(--space-md);
  border: 0;
  background: transparent;
  color: var(--color-foreground);
  outline: 0;
}

.hero__search-status {
  flex: 0 0 auto;
  color: var(--color-muted-foreground);
  font-size: 0.8125rem;
}

.hero__search-button {
  flex: 0 0 auto;
  margin: var(--space-xs);
  white-space: nowrap;
}

.hero__search-results {
  position: absolute;
  top: calc(100% + var(--space-sm));
  right: 0;
  left: 0;
  z-index: 3;
  margin: 0;
  padding: var(--space-xs);
  list-style: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card);
  box-shadow: var(--shadow-lg);
}

.hero__search-results button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: background-color var(--transition-base);
}

.hero__search-results button:hover,
.hero__search-results button:focus-visible {
  background: var(--color-muted);
}

.hero__search-results img,
.hero__search-results .pi-image {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  object-fit: contain;
}

.hero__search-results span {
  display: grid;
  gap: var(--space-xs);
}

.hero__search-results small {
  color: #047857;
  font-weight: 700;
}

.hero__popular-searches {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  color: var(--color-muted-foreground);
  font-size: 0.8125rem;
}

.hero__popular-searches a {
  color: var(--color-foreground);
  font-weight: 600;
  text-decoration: none;
}

.hero__popular-searches a:hover,
.hero__popular-searches a:focus-visible {
  color: var(--color-accent);
  text-decoration: underline;
}

.hero__services {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-md);
  width: min(100% - clamp(var(--space-md), 7vw, 8rem), 52rem);
  margin: var(--space-md) auto var(--space-xl);
}

.hero__services a {
  display: grid;
  grid-template-columns: auto 1fr auto;
  min-height: 68px;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  background: var(--color-muted);
  color: var(--color-foreground);
  text-decoration: none;
  transition:
    background-color var(--transition-base),
    box-shadow var(--transition-base);
}

.hero__services a:hover,
.hero__services a:focus-visible {
  background: var(--color-card);
  box-shadow: var(--shadow-sm);
}

.hero__services>a>.pi:first-child {
  color: var(--color-accent);
  font-size: 1.5rem;
}

.hero__services>a>.pi:last-child {
  color: var(--color-primary);
}

.hero__services span {
  display: grid;
  gap: 2px;
}

.hero__services strong {
  font-family: Figtree, Arial, sans-serif;
  font-size: 0.9375rem;
}

.hero__services small {
  color: var(--color-muted-foreground);
  font-size: 0.75rem;
}

.hero__promotions {
  margin: 0 clamp(var(--space-md), 4vw, var(--space-3xl)) clamp(var(--space-md), 4vw, var(--space-3xl));
}

.hero__promotion-card {
  display: block;
  overflow: hidden;
  margin: var(--space-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition:
    box-shadow var(--transition-base),
    border-color var(--transition-base);
}

.hero__promotion-card:hover,
.hero__promotion-card:focus-visible {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.hero__promotion-card img {
  display: block;
  width: 100%;
  aspect-ratio: 592 / 254;
  object-fit: cover;
}

.hero__promotions :deep(.p-carousel-content) {
  align-items: center;
  gap: var(--space-sm);
}

.hero__promotions :deep(.p-carousel-container) {
  min-width: 0;
}

.hero__promotions :deep(.p-carousel-prev-button),
.hero__promotions :deep(.p-carousel-next-button) {
  display: inline-flex;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--color-primary);
  border-radius: 50%;
  background: var(--color-card);
  color: var(--color-primary);
  cursor: pointer;
  transition:
    background-color var(--transition-base),
    color var(--transition-base),
    box-shadow var(--transition-base);
}

.hero__promotions :deep(.p-carousel-prev-button:hover),
.hero__promotions :deep(.p-carousel-next-button:hover) {
  background: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: var(--shadow-sm);
}

.hero__promotions :deep(.p-carousel-prev-button:focus-visible),
.hero__promotions :deep(.p-carousel-next-button:focus-visible),
.hero__promotion-card:focus-visible,
.hero__services a:focus-visible,
.hero__popular-searches a:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-ring) 35%, transparent);
  outline-offset: 2px;
}

.homepage__section {
  scroll-margin-top: var(--space-xl);
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.section-heading h2,
.trust-signals h2 {
  margin: 0;
  font-size: clamp(1.5rem, 2vw, 2rem);
}

.section-heading__link {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: var(--space-sm);
  color: #0e7490;
  font-weight: 700;
  text-decoration: none;
}

.section-heading__link:hover {
  color: var(--color-accent);
  text-decoration: underline;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: var(--space-md);
}

.category-card {
  display: grid;
  min-height: 156px;
  align-content: space-between;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card);
  box-shadow: var(--shadow-sm);
  color: var(--color-card-foreground);
  font-family: Figtree, Arial, sans-serif;
  font-weight: 700;
  text-decoration: none;
  transition:
    box-shadow var(--transition-base),
    transform var(--transition-base),
    border-color var(--transition-base);
}

.category-card:hover,
.category-card:focus-visible {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.category-card__icon {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 50%;
  background: var(--color-muted);
  color: var(--color-primary);
  font-size: 1.25rem;
}

.category-card__arrow {
  justify-self: end;
  color: var(--color-accent);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-lg);
}

.flash-sale {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-muted);
  box-shadow: var(--shadow-md);
}

.flash-sale__banner {
  display: block;
  width: 100%;
  min-height: 150px;
  max-height: 260px;
  object-fit: cover;
}

.flash-sale__content {
  padding: clamp(var(--space-md), 3vw, var(--space-xl));
  background:
    radial-gradient(circle at top right,
      color-mix(in srgb, var(--color-secondary) 30%, transparent),
      transparent 25rem),
    var(--color-background);
}

.flash-sale__heading {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.flash-sale__eyebrow {
  margin: 0 0 var(--space-xs);
  color: #0e7490;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.flash-sale__heading h2 {
  margin: 0;
  color: var(--color-foreground);
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  text-transform: uppercase;
}

.flash-sale__timer {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-left: auto;
}

.flash-sale__timer-label {
  color: var(--color-muted-foreground);
  font-size: 0.8125rem;
  font-weight: 700;
}

.flash-sale__time-unit {
  display: grid;
  min-width: 46px;
  place-items: center;
  gap: 2px;
}

.flash-sale__time-unit strong {
  min-width: 42px;
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.flash-sale__time-unit small {
  color: var(--color-muted-foreground);
  font-size: 0.6875rem;
}

.flash-sale__all-link {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: var(--space-sm);
  color: #0e7490;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.flash-sale__all-link:hover {
  color: var(--color-accent);
  text-decoration: underline;
}

.flash-sale__categories {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.flash-sale__categories span {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-primary);
  border-radius: 999px;
  background: var(--color-card);
  color: var(--color-foreground);
  font-size: 0.875rem;
  font-weight: 600;
}

.flash-sale__products {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-md);
}

.product-carousel {
  position: relative;
}

.product-carousel__item {
  height: 100%;
  padding: var(--space-xs);
}

.product-carousel :deep(.p-carousel-content) {
  align-items: stretch;
  gap: var(--space-sm);
}

.product-carousel :deep(.p-carousel-container) {
  min-width: 0;
}

.product-carousel :deep(.p-carousel-viewport) {
  padding: var(--space-xs) 0;
}

.product-carousel :deep(.p-carousel-item) {
  display: flex;
  align-items: stretch;
}

.product-carousel :deep(.p-carousel-prev-button),
.product-carousel :deep(.p-carousel-next-button) {
  display: inline-flex !important;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  border: 1px solid var(--color-primary);
  border-radius: 50%;
  background: var(--color-card);
  color: var(--color-primary);
  cursor: pointer;
  transition:
    background-color var(--transition-base),
    color var(--transition-base),
    box-shadow var(--transition-base);
}

.product-carousel :deep(.p-carousel-prev-button .p-button-icon),
.product-carousel :deep(.p-carousel-next-button .p-button-icon) {
  width: 1rem;
  height: 1rem;
  margin: 0;
}

.product-carousel :deep(.p-carousel-prev-button:disabled),
.product-carousel :deep(.p-carousel-next-button:disabled) {
  display: none !important;
}

.product-carousel :deep(.p-carousel-prev-button:hover),
.product-carousel :deep(.p-carousel-next-button:hover) {
  background: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: var(--shadow-md);
}

.product-carousel :deep(.p-carousel-prev-button:focus-visible),
.product-carousel :deep(.p-carousel-next-button:focus-visible) {
  outline: 3px solid color-mix(in srgb, var(--color-ring) 35%, transparent);
  outline-offset: 2px;
}

.product-skeleton,
.state-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card);
  box-shadow: var(--shadow-sm);
}

.product-skeleton {
  min-height: 360px;
  background: linear-gradient(110deg, var(--color-muted) 20%, #f7feff 45%, var(--color-muted) 70%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

.state-card {
  display: grid;
  min-height: 132px;
  place-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  color: var(--color-muted-foreground);
  text-align: center;
}

.state-card p {
  margin: 0;
  max-width: 100%;
  overflow-wrap: break-word;
}

.state-card--error {
  color: #991b1b;
}

.trust-signals {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-lg);
  padding: var(--space-xl);
  border-radius: var(--radius-lg);
  background: var(--color-muted);
}

.trust-signals article {
  display: grid;
  gap: var(--space-sm);
}

.trust-signals__icon {
  color: var(--color-accent);
  font-size: 1.75rem;
}

.trust-signals h2 {
  font-size: 1.125rem;
}

.trust-signals p {
  margin: 0;
  color: var(--color-muted-foreground);
  line-height: 1.6;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

@media (max-width: 1024px) {
  .category-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .homepage {
    gap: var(--space-2xl);
  }

  .hero__masthead {
    min-height: 320px;
    background-position: 62% center;
  }

  .hero__search-panel {
    width: calc(100% - var(--space-xl));
    margin-top: 230px;
  }

  .hero__services {
    width: calc(100% - var(--space-xl));
  }
}

@media (max-width: 640px) {
  .homepage {
    width: calc(100vw - var(--space-md) - var(--space-md));
  }

  .hero {
    border-radius: var(--radius-md);
  }

  .hero__masthead {
    min-height: 300px;
    background-position: 63% center;
  }

  .hero__search-panel {
    width: calc(100% - var(--space-md) - var(--space-md));
    margin-top: 220px;
    padding: var(--space-sm);
  }

  .hero__search {
    flex-wrap: wrap;
    padding: var(--space-xs);
  }

  .hero__search-icon {
    margin-left: var(--space-sm);
  }

  .hero__search-input {
    width: calc(100% - 3rem);
    flex: 1;
  }

  .hero__search-status {
    margin-left: auto;
  }

  .hero__search-button {
    width: 100%;
  }

  .hero__popular-searches {
    gap: var(--space-xs) var(--space-sm);
  }

  .hero__search-results {
    top: calc(100% + var(--space-sm));
  }

  .hero__services {
    grid-template-columns: 1fr;
    width: calc(100% - var(--space-md) - var(--space-md));
    margin-bottom: var(--space-md);
  }

  .hero__services a {
    min-height: 60px;
  }

  .hero__promotions {
    margin: 0 var(--space-sm) var(--space-sm);
  }

  .hero__promotions :deep(.p-carousel-content) {
    gap: var(--space-xs);
  }

  .hero__promotions :deep(.p-carousel-prev-button),
  .hero__promotions :deep(.p-carousel-next-button) {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
  }

  .section-heading--with-action {
    align-items: start;
    flex-direction: column;
  }

  .flash-sale__banner {
    min-height: 110px;
  }

  .flash-sale__heading {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .flash-sale__timer {
    order: 3;
    width: 100%;
    margin-left: 0;
  }

  .flash-sale__all-link {
    margin-left: auto;
  }

  .category-grid,
  .product-grid,
  .trust-signals {
    grid-template-columns: 1fr;
  }

  .category-card {
    min-height: 120px;
  }

  .trust-signals {
    padding: var(--space-lg);
  }
}
</style>
