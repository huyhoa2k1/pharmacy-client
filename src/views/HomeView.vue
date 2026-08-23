<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { IGetProductResponse } from '@/api/models/product'
import { ProductService } from '@/api/services/product'
import type { IGetCategoryResponse } from '@/api/models/category'
import { CategoryService } from '@/api/services/category'
import ProductCard from '@/components/ProductCard/ProductCard.vue'
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

const categoryIcons = ['pi-heart', 'pi-sparkles', 'pi-sun', 'pi-users', 'pi-plus-circle', 'pi-home']

const visibleCategories = computed(() => categories.value.slice(0, 6))

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
      <div class="section-heading">
        <div>
          <p class="section-heading__eyebrow">Ưu đãi hôm nay</p>
          <h2 id="sale-heading">Sản phẩm đang giảm giá</h2>
        </div>
      </div>

      <div v-if="isLoadingProducts" class="product-grid product-grid--loading" aria-busy="true">
        <div v-for="item in 4" :key="item" class="product-skeleton" aria-hidden="true"></div>
      </div>
      <div v-else-if="productsError" class="state-card state-card--error" role="alert">
        <p>{{ productsError }}</p>
        <button class="btn-secondary" type="button" @click="getProducts">Thử lại</button>
      </div>
      <p v-else-if="saleProducts.length === 0" class="state-card">
        Hiện chưa có sản phẩm giảm giá.
      </p>
      <div v-else class="product-grid">
        <ProductCard
          v-for="product in saleProducts.slice(0, 4)"
          :key="product.id"
          :data="product"
        />
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
      <div v-else class="product-grid">
        <ProductCard v-for="product in bestSellers.slice(0, 4)" :key="product.id" :data="product" />
      </div>
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
