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
let saleTimerId: ReturnType<typeof setInterval> | undefined

const categoryIcons = ['pi-heart', 'pi-sparkles', 'pi-sun', 'pi-users', 'pi-plus-circle', 'pi-home']
const carouselResponsiveOptions = [
  { breakpoint: '1200px', numVisible: 3, numScroll: 1 },
  { breakpoint: '768px', numVisible: 2, numScroll: 1 },
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

onMounted(() => {
  getProducts()
  getCategories()
  saleTimerId = setInterval(() => {
    saleNow.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (saleTimerId) clearInterval(saleTimerId)
})
</script>

<template>
  <main class="homepage">
    <section class="hero" aria-labelledby="hero-heading">
      <div class="hero__content">
        <p class="hero__eyebrow">Chăm sóc sức khỏe mỗi ngày</p>
        <h1 id="hero-heading">Tìm đúng sản phẩm cho sức khỏe của bạn</h1>
        <p class="hero__description">
          Khám phá thuốc, vitamin và sản phẩm chăm sóc sức khỏe từ các thương hiệu đáng tin cậy.
        </p>

        <form class="hero__search" role="search" @submit.prevent="submitSearch">
          <label class="sr-only" for="medicine-search"
            >Tìm thuốc, vitamin hoặc sản phẩm chăm sóc sức khỏe</label
          >
          <i class="pi pi-search hero__search-icon" aria-hidden="true"></i>
          <input
            id="medicine-search"
            v-model="searchTerm"
            class="hero__search-input"
            type="search"
            autocomplete="off"
            placeholder="Tìm thuốc, vitamin, sản phẩm chăm sóc sức khỏe..."
            :aria-expanded="searchResults.length > 0"
            aria-controls="medicine-search-results"
            @input="handleSearchInput"
          />
          <span v-if="isSearching" class="hero__search-status" role="status">Đang tìm</span>
          <button class="btn-primary hero__search-button" type="submit">Tìm sản phẩm</button>

          <ul
            v-if="searchResults.length"
            id="medicine-search-results"
            class="hero__search-results"
            role="listbox"
            aria-label="Kết quả tìm kiếm"
          >
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

        <div class="hero__actions">
          <a class="btn-primary" href="#recommendations">Khám phá sản phẩm</a>
          <a class="btn-secondary" href="#categories">Xem danh mục</a>
        </div>
      </div>

      <aside class="hero__trust-card" aria-label="Cam kết của Pharmacy">
        <i class="pi pi-verified hero__trust-icon" aria-hidden="true"></i>
        <div>
          <strong>Sản phẩm được chọn lọc</strong>
          <p>Thông tin rõ ràng để bạn an tâm lựa chọn.</p>
        </div>
      </aside>
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
        <router-link
          v-for="(category, index) in visibleCategories"
          :key="category.id"
          :to="{ name: 'products', params: { categoryId: category.id } }"
          class="category-card"
        >
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
        <img
          class="flash-sale__banner"
          src="https://prod-cdn.pharmacity.io/e-com/images/flashsale/20260805020324-0-Home_Flashsale_web.png?versionId=qcHQ6.0JKKgkZNotOyzH659ni7BfmvOf"
          alt="Ưu đãi Flash Sale"
        />

        <div class="flash-sale__content">
          <div class="flash-sale__heading">
            <div>
              <p class="flash-sale__eyebrow">Ưu đãi trong ngày</p>
              <h2 id="sale-heading">Flash Sale</h2>
            </div>
            <div class="flash-sale__timer" aria-live="polite" aria-label="Thời gian còn lại">
              <span class="flash-sale__timer-label">Kết thúc sau</span>
              <span
                v-for="(unit, index) in saleCountdown"
                :key="['giờ', 'phút', 'giây'][index]"
                class="flash-sale__time-unit"
              >
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

          <div
            v-if="isLoadingProducts"
            class="flash-sale__products product-grid--loading"
            aria-busy="true"
          >
            <div v-for="item in 4" :key="item" class="product-skeleton" aria-hidden="true"></div>
          </div>
          <div v-else-if="productsError" class="state-card state-card--error" role="alert">
            <p>{{ productsError }}</p>
            <button class="btn-secondary" type="button" @click="getProducts">Thử lại</button>
          </div>
          <p v-else-if="saleProducts.length === 0" class="state-card">
            Hiện chưa có sản phẩm giảm giá.
          </p>
          <Carousel
            v-else
            class="product-carousel product-carousel--flash-sale"
            :value="saleProducts"
            :num-visible="4"
            :num-scroll="1"
            :responsive-options="carouselResponsiveOptions"
            :show-indicators="false"
          >
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
      <Carousel
        v-else
        class="product-carousel"
        :value="bestSellers"
        :num-visible="4"
        :num-scroll="1"
        :responsive-options="carouselResponsiveOptions"
        :show-indicators="false"
      >
        <template #item="slotProps">
          <div class="product-carousel__item">
            <ProductCard :data="slotProps.data" />
          </div>
        </template>
      </Carousel>
    </section>

    <section class="trust-signals" aria-label="Lý do chọn Pharmacy">
      <article>
        <i class="pi pi-shield trust-signals__icon" aria-hidden="true"></i>
        <h2>Chất lượng rõ ràng</h2>
        <p>Thông tin sản phẩm minh bạch để bạn dễ đối chiếu và lựa chọn.</p>
      </article>
      <article>
        <i class="pi pi-truck trust-signals__icon" aria-hidden="true"></i>
        <h2>Giao hàng thuận tiện</h2>
        <p>Theo dõi đơn hàng của bạn từ lúc xác nhận đến khi nhận hàng.</p>
      </article>
      <article>
        <i class="pi pi-comments trust-signals__icon" aria-hidden="true"></i>
        <h2>Hỗ trợ tận tâm</h2>
        <p>Đội ngũ luôn sẵn sàng hỗ trợ khi bạn cần thêm thông tin.</p>
      </article>
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
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 0.38fr);
  gap: var(--space-xl);
  min-width: 0;
  overflow: hidden;
  padding: clamp(var(--space-xl), 5vw, var(--space-3xl));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 88% 16%, rgba(34, 211, 238, 0.35), transparent 25rem),
    var(--color-card);
  box-shadow: var(--shadow-md);
}

.hero::after {
  position: absolute;
  right: -4rem;
  bottom: -6rem;
  width: 16rem;
  height: 16rem;
  border-radius: 50%;
  background: var(--color-muted);
  content: '';
}

.hero__content,
.hero__trust-card {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.hero__eyebrow,
.section-heading__eyebrow {
  margin: 0 0 var(--space-sm);
  color: #0e7490;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.hero h1 {
  max-width: 12ch;
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.5rem);
  line-height: 1.06;
}

.hero__description {
  max-width: 58ch;
  margin: var(--space-md) 0 var(--space-xl);
  color: var(--color-muted-foreground);
  font-size: 1.0625rem;
  line-height: 1.65;
  overflow-wrap: break-word;
}

.hero__search {
  position: relative;
  display: flex;
  max-width: 46rem;
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

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-top: var(--space-lg);
  min-width: 0;
}

.hero__actions a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.hero__trust-card {
  align-self: end;
  display: flex;
  gap: var(--space-md);
  padding: var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-card) 80%, transparent);
  box-shadow: var(--shadow-sm);
}

.hero__trust-card strong {
  display: block;
  margin-bottom: var(--space-xs);
  font-family: Figtree, Arial, sans-serif;
  font-size: 1.125rem;
}

.hero__trust-card p {
  margin: 0;
  color: var(--color-muted-foreground);
  line-height: 1.55;
}

.hero__trust-icon,
.trust-signals__icon {
  color: var(--color-accent);
  font-size: 1.75rem;
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
    radial-gradient(
      circle at top right,
      color-mix(in srgb, var(--color-secondary) 30%, transparent),
      transparent 25rem
    ),
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

  .hero {
    grid-template-columns: 1fr;
  }

  .hero__trust-card {
    max-width: 32rem;
  }
}

@media (max-width: 640px) {
  .homepage {
    width: calc(100vw - var(--space-md) - var(--space-md));
  }

  .hero {
    padding: var(--space-lg);
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

  .hero__actions {
    flex-direction: column;
  }

  .hero__actions a {
    width: 100%;
  }

  .hero__search-results {
    top: calc(100% + var(--space-sm));
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
