<template>
  <div class="product-view">
    <div class="product-left">
      <div class="product-description">
        <Swiper :images="data.imageUrl" />
        <MainInfo :product="data" />
      </div>
    </div>
    <div class="product-right">
      <!-- Quantity Section -->
      <div class="border-b border-[var(--color-border)] pb-6">
        <p class="text-[var(--color-foreground)] font-semibold text-sm mb-3">Số lượng</p>
        <div class="flex items-center gap-3 bg-[var(--color-muted)] w-fit p-2 rounded-lg">
          <button @click="decreaseQuantity"
            class="quantity-control rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition">
            <MinusOutlined class="text-sm" />
          </button>
          <input type="text" class="w-12 text-center font-bold text-[var(--color-foreground)] bg-transparent border-0 outline-none"
            v-model.number="quantity" readonly>
          <button @click="increaseQuantity"
            class="quantity-control rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition">
            <PlusOutlined class="text-sm" />
          </button>
        </div>
        <p class="text-xs text-[var(--color-muted-foreground)] mt-2">Còn {{ data.amount }} sản phẩm</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-3 py-6 border-b border-[var(--color-border)]">
        <a-button type="primary" size="large" @click="buyNow"
          class="product-buy-button w-full font-semibold text-base h-12 rounded-lg border-0">
          <i class="pi pi-bolt mr-2"></i>
          Mua ngay
        </a-button>
        <a-button size="large" @click="addToCart"
          class="product-cart-button w-full font-semibold text-base h-12 rounded-lg border-2">
          <i class="pi pi-shopping-cart mr-2"></i>
          Thêm vào giỏ hàng
        </a-button>
      </div>

      <!-- Benefits -->
      <div class="grid grid-cols-2 gap-4 py-6 border-b border-[var(--color-border)]">
        <div class="text-center">
          <div class="flex justify-center mb-2">
            <i class="pi pi-clock text-[var(--color-accent)] text-2xl"></i>
          </div>
          <p class="text-xs font-semibold text-[var(--color-foreground)]">Giao hàng siêu tốc</p>
          <p class="text-xs text-[var(--color-muted-foreground)] mt-1">Trong 24h</p>
        </div>
        <div class="text-center">
          <div class="flex justify-center mb-2">
            <i class="pi pi-truck text-[var(--color-accent)] text-2xl"></i>
          </div>
          <p class="text-xs font-semibold text-[var(--color-foreground)]">Miễn phí vận chuyển</p>
          <p class="text-xs text-[var(--color-muted-foreground)] mt-1">Từ 50.000đ</p>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="pt-4 space-y-3">
        <div class="flex items-center gap-2">
          <i class="pi pi-shield text-[var(--color-accent)]"></i>
          <span class="text-sm text-[var(--color-foreground)]">Bảo hành chính hãng</span>
        </div>
        <div class="flex items-center gap-2">
          <i class="pi pi-check-circle text-[var(--color-accent)]"></i>
          <span class="text-sm text-[var(--color-foreground)]">Hàng chính hãng 100%</span>
        </div>
        <div class="flex items-center gap-2">
          <i class="pi pi-times-circle text-[var(--color-destructive)]"></i>
          <span class="text-sm text-[var(--color-foreground)]">Không chấp nhận đổi trả</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Swiper from '@/components/Product/Swiper/Swiper.vue';
import MainInfo from '@/components/Product/MainInfo/index.vue';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { ProductService } from '@/api/services/product';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { useCartStore } from '@/stores/cart';
import type { IGetProductResponse } from '@/api/models/product';
import type { CartItem } from '@/utils/index.type';

const route = useRoute();
const cartStore = useCartStore();
const data = ref<IGetProductResponse>({} as IGetProductResponse);
const quantity = ref(1);



const getProductDetail = async () => {
  const res = await ProductService.getProductById(Number(route.params.id));
  data.value = res;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const increaseQuantity = () => {
  if (quantity.value < data.value.amount) {
    quantity.value++;
  }
};

const addToCart = () => {
  if (!data.value.id) {
    message.warning('Không tìm thấy sản phẩm');
    return;
  }

  const existingItemIndex = cartStore.cart.findIndex(item => item.id === data.value.id);

  if (existingItemIndex !== -1) {
    // If product already in cart, increase quantity
    const newQuantity = cartStore.cart[existingItemIndex].cartQuantity + quantity.value;
    if (newQuantity > data.value.amount) {
      cartStore.updateItem(existingItemIndex, data.value.amount);
      message.warning(`Chỉ có thể thêm tối đa ${data.value.amount} sản phẩm`);
    } else {
      cartStore.updateItem(existingItemIndex, newQuantity);
    }
  } else {
    // Add new item to cart
    const newItem: CartItem = {
      ...data.value,
      cartQuantity: quantity.value,
      addedAt: Date.now()
    };
    cartStore.addToCart(newItem);
  }

  message.success(`Đã thêm ${quantity.value} sản phẩm vào giỏ hàng`);
  quantity.value = 1; // Reset quantity
};

// Buy now (add to cart + redirect)
const buyNow = () => {
  addToCart();
  // Redirect to cart after a short delay
  setTimeout(() => {
    window.location.href = '/cart';
  }, 500);
};

onMounted(() => {
  cartStore.loadCart();
  getProductDetail();
});

// Watch for route params changes to reload data when product ID changes
watch(() => route.params.id, () => {
  quantity.value = 1; // Reset quantity when switching products
  getProductDetail();
});
</script>

<style scoped>
.product-view {
  background-color: var(--color-card);
  display: grid;
  grid-template-columns: min(74%, calc(888rem/16)) 1fr;
  gap: 32px;
  padding: 32px 16px;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
}

.product-description {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.product-right {
  display: flex;
  flex-direction: column;
  background: var(--color-card);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 24px;
}

.quantity-control {
  background: var(--color-border);
  color: var(--color-foreground);
}

.quantity-control:hover {
  background: var(--color-secondary);
}

.product-buy-button {
  background: var(--color-accent) !important;
  color: var(--color-on-accent) !important;
}

.product-buy-button:hover {
  background: color-mix(in srgb, var(--color-accent) 90%, #000000) !important;
}

.product-cart-button {
  border-color: var(--color-primary) !important;
  color: var(--color-primary) !important;
}

.product-cart-button:hover {
  background: color-mix(in srgb, var(--color-primary) 8%, transparent) !important;
}

@media (max-width: 1024px) {
  .product-view {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 16px 8px;
  }

  .product-description {
    grid-template-columns: 1fr;
  }

  .product-right {
    padding: 16px;
  }
}
</style>
