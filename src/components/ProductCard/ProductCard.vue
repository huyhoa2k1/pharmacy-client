<template>
  <article class="product-card">
    <router-link
      class="product-card__details"
      :to="productRoute"
      :aria-label="`Xem chi tiết ${data.name}`"
    >
      <div class="product-card__image-wrap">
        <img
          v-if="data.imageUrl[0]"
          class="product-card__image"
          :src="data.imageUrl[0]"
          :alt="data.name"
        />
        <i v-else class="pi pi-image product-card__image-placeholder" aria-hidden="true"></i>

        <span v-if="data.discount > 0" class="product-card__discount">-{{ data.discount }}%</span>
        <span
          class="product-card__availability"
          :class="{ 'product-card__availability--out': data.amount <= 0 }"
        >
          {{ availabilityLabel }}
        </span>
      </div>

      <div class="product-card__content">
        <p v-if="data.brand?.name" class="product-card__brand">{{ data.brand.name }}</p>
        <h3 class="product-card__name">{{ data.name }}</h3>

        <div class="product-card__rating" aria-label="Chưa có đánh giá">
          <i class="pi pi-star product-card__rating-icon" aria-hidden="true"></i>
          <span>Chưa có đánh giá</span>
        </div>

        <div class="product-card__price">
          <span class="product-card__current-price">{{ formatPrice(discountedPrice) }} đ</span>
          <span v-if="data.discount > 0" class="product-card__original-price">
            {{ formatPrice(data.price) }} đ
          </span>
        </div>
      </div>
    </router-link>

    <div class="product-card__action">
      <button
        type="button"
        class="product-card__add-to-cart"
        :aria-label="`Thêm ${data.name} vào giỏ hàng`"
        @click="addToCart"
      >
        <i class="pi pi-shopping-cart" aria-hidden="true"></i>
        <span>Thêm vào giỏ</span>
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { message } from 'ant-design-vue'
import { useCartStore } from '@/stores/cart'
import type { IGetProductResponse } from '@/api/models/product'
import type { CartItem } from '@/utils/index.type'

const cartStore = useCartStore()

const props = defineProps<{
  data: IGetProductResponse
}>()

const productRoute = computed(() => ({
  name: 'product-detail',
  params: {
    categoryId: props.data.brand.categoryId,
    id: props.data.id,
  },
}))

const discountedPrice = computed(
  () => props.data.price - (props.data.price * props.data.discount) / 100,
)

const availabilityLabel = computed(() =>
  props.data.amount > 0 ? `Còn ${props.data.amount} sản phẩm` : 'Tạm hết hàng',
)

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price)
}

const addToCart = () => {
  const existingItemIndex = cartStore.cart.findIndex((item) => item.id === props.data.id)

  if (existingItemIndex !== -1) {
    cartStore.updateItem(existingItemIndex, cartStore.cart[existingItemIndex].cartQuantity + 1)
  } else {
    const newItem: CartItem = {
      ...props.data,
      cartQuantity: 1,
      addedAt: Date.now(),
    }
    cartStore.addToCart(newItem)
  }

  message.success('Đã thêm vào giỏ hàng')
}
</script>

<style scoped>
.product-card {
  display: flex;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  box-shadow: var(--shadow-md);
  transition: box-shadow var(--transition-base), transform var(--transition-base);
}

.product-card:hover,
.product-card:focus-within {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.product-card__details {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  color: inherit;
  text-decoration: none;
}

.product-card__details:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-ring) 35%, transparent);
  outline-offset: -3px;
}

.product-card__image-wrap {
  position: relative;
  display: flex;
  aspect-ratio: 1;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-card);
  padding: var(--space-md);
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-card__image-placeholder {
  color: var(--color-muted-foreground);
  font-size: 2rem;
}

.product-card__discount,
.product-card__availability {
  position: absolute;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.25;
}

.product-card__discount {
  top: var(--space-sm);
  left: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-destructive);
  color: var(--color-on-destructive);
}

.product-card__availability {
  right: var(--space-sm);
  bottom: var(--space-sm);
  max-width: calc(100% - var(--space-md));
  padding: var(--space-xs) var(--space-sm);
  background: #D1FAE5;
  color: #065F46;
  text-align: right;
}

.product-card__availability--out {
  background: #FEE2E2;
  color: #991B1B;
}

.product-card__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
}

.product-card__brand,
.product-card__rating,
.product-card__original-price {
  color: var(--color-muted-foreground);
  font-size: 0.75rem;
}

.product-card__brand {
  margin: 0;
  font-weight: 600;
}

.product-card__name {
  display: -webkit-box;
  min-height: 2.8em;
  margin: 0;
  overflow: hidden;
  color: var(--color-card-foreground);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-card__rating {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

.product-card__rating-icon {
  color: #D97706;
}

.product-card__price {
  display: flex;
  min-height: 2.9rem;
  flex-direction: column;
  justify-content: end;
  gap: var(--space-xs);
  margin-top: auto;
}

.product-card__current-price {
  color: #047857;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.2;
}

.product-card__original-price {
  text-decoration: line-through;
}

.product-card__action {
  padding: 0 var(--space-md) var(--space-md);
}

.product-card__add-to-cart {
  display: inline-flex;
  width: 100%;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: #FFFFFF;
  cursor: pointer;
  font-weight: 600;
  transition: background-color var(--transition-base), box-shadow var(--transition-base),
    transform var(--transition-base);
}

.product-card__add-to-cart:hover {
  background: #047857;
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.product-card__add-to-cart:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-ring) 35%, transparent);
  outline-offset: 2px;
}

@media (max-width: 480px) {
  .product-card__content,
  .product-card__action {
    padding-right: var(--space-sm);
    padding-left: var(--space-sm);
  }

  .product-card__content {
    gap: var(--space-xs);
    padding-top: var(--space-sm);
    padding-bottom: var(--space-sm);
  }

  .product-card__name {
    font-size: 0.9375rem;
  }

  .product-card__current-price {
    font-size: 1rem;
  }
}
</style>
