<template>
  <div class="header-gradient">
    <div class="flex flex-col md:flex-row items-center justify-between py-2 px-2 w-full max-w-6xl mx-auto gap-4">

      <!-- Logo -->
      <div class="flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition"
        @click="$router.push('/')">
        <img class="w-10 h-10" :src="logoSrc" alt="Logo">
        <span class="text-2xl md:text-3xl font-bold text-violet-500 drop-shadow-lg">Pharmacy</span>
      </div>

      <!-- Search -->
      <div class="w-full md:w-auto">
        <a-spin :spinning="searchLoading" tip="Đang tìm kiếm..." size="large">
          <a-auto-complete v-model:value="searchValue" :options="autocompleteOptions" :allow-clear="true"
            :loading="searchLoading" placeholder="Tìm kiếm thuốc..." class=" w-full md:w-[350px]" style="width: 400px;"
            @select="handleSearchSelect" @search="handleSearch">
            <template #option="{ imageUrl, label, price }">
              <div class="flex items-center gap-3 py-2">
                <img v-if="imageUrl" :src="imageUrl" :alt="label" class="w-12 h-12 object-cover rounded">
                <div class="flex-1">
                  <div class="font-semibold text-gray-800">{{ label }}</div>
                  <div class="text-sm text-violet-600 font-bold">{{ price?.toLocaleString() }} đ</div>
                </div>
              </div>
            </template>
          </a-auto-complete>
        </a-spin>
      </div>

      <!-- Icons -->
      <div class="flex items-center justify-center gap-6">

        <router-link to="/cart" class="flex items-center gap-2">
          <div
            class="icon-hover group relative flex items-center gap-2 px-2 py-1 rounded text-violet-600 hover:text-violet-700 hover:bg-violet-50 cursor-pointer transition hover:shadow-md">
            <a-badge :size="'small'" :count="cartStore.cartCount" class="animate-pulse">
              <i class="pi pi-shopping-cart text-lg text-violet-600 hover:text-violet-700"></i>
            </a-badge>
            <span class="text-sm md:text-base font-semibold">Giỏ hàng</span>
          </div>
        </router-link>

        <a-dropdown :placement="'bottom'" :arrow="{ pointAtCenter: true }">
          <div @click="openAuthDialog"
            class="flex items-center gap-2 px-2 py-1 rounded text-violet-600 hover:text-violet-700 hover:bg-violet-50 cursor-pointer transition hover:shadow-md">
            <i class="pi pi-user text-lg"></i>
            <span class="text-sm md:text-base font-semibold">
              {{ userStore.isLogin ? userStore.username : "Đăng nhập" }}
            </span>
          </div>
          <template #overlay v-if="userStore.isLogin">
            <a-menu>
              <a-menu-item key="1" @click="() => $router.push('/ca-nhan/thong-tin')">
                <div>
                  <i class="pi pi-user mr-2"></i>
                  <span>Thông tin cá nhân</span>
                </div>
              </a-menu-item>
              <a-menu-item key="2" @click="() => $router.push('/ca-nhan/don-hang')">
                <div>
                  <i class="pi pi-shopping-cart mr-2"></i>
                  <span>Đơn hàng của tôi</span>
                </div>
              </a-menu-item>
              <a-menu-item key="3">
                <div>
                  <i class="pi pi-sign-out mr-2"></i>
                  <span @click="handleLogout">Đăng xuất</span>
                </div>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>

    </div>
  </div>

  <!-- Auth Dialog -->
  <AuthDialog ref="authDialogRef" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AuthDialog from '@/components/Auth/AuthDialog.vue';
import { useUserStore } from '@/stores/user';
import { useCartStore } from '@/stores/cart';
import { ProductService } from '@/api/services/product';
import { getCloudinaryImageUrl } from '@/utils/cloudinary';
import { LOGO_PUBLIC_ID } from '@/config/assetConfig';
import { debounce } from 'lodash';

const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();

const logoSrc = computed(() =>
  getCloudinaryImageUrl(LOGO_PUBLIC_ID),
);


const authDialogRef = ref<InstanceType<typeof AuthDialog>>();
const searchValue = ref('');
const autocompleteOptions = ref<any[]>([]);
const searchLoading = ref(false);

const handleSearch = debounce(async (value: string) => {
  if (!value) {
    autocompleteOptions.value = [];
    searchLoading.value = false;
    return;
  }
  searchLoading.value = true;
  try {
    const response = await ProductService.searchProducts(value);
    if (response) {
      autocompleteOptions.value = response.slice(0, 10).map(product => ({
        label: product.name,
        value: product.id,
        imageUrl: product.imageUrl?.[0],
        price: product.price,
        product
      }));
    }
  } catch (error) {
    autocompleteOptions.value = [];
  } finally {
    searchLoading.value = false;
  }
}, 1000);

const handleSearchSelect = (value: number) => {
  const selected = autocompleteOptions.value.find(option => option.value === value);
  if (selected) {
    router.push(`/products/${selected.value}`);
    searchValue.value = '';
    autocompleteOptions.value = [];
  }
};

const openAuthDialog = () => {
  if (userStore.isLogin) return;
  authDialogRef.value?.openModal();
};

const handleLogout = () => {
  userStore.logout();
  localStorage.removeItem('token');
};

onMounted(() => {
  cartStore.loadCart();
  cartStore.initStorageListener();
});

</script>

<style scoped>
.header-gradient {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.search-input :deep(.ant-input-affix-wrapper) {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(167, 139, 250, 0.5);
  border-radius: 8px;
  padding: 8px 12px;
  transition: all 0.3s ease;
}

.search-input :deep(.ant-input-affix-wrapper:hover),
.search-input :deep(.ant-input-affix-wrapper:focus-within) {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(167, 139, 250, 0.8);
  box-shadow: 0 0 12px rgba(167, 139, 250, 0.3);
}

.search-input :deep(.ant-select-selector) {
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(167, 139, 250, 0.5) !important;
  border-radius: 8px !important;
  padding: 8px 12px !important;
  transition: all 0.3s ease !important;
}

.search-input :deep(.ant-select-selector:hover),
.search-input :deep(.ant-select-focused .ant-select-selector) {
  background: rgba(255, 255, 255, 1) !important;
  border-color: rgba(167, 139, 250, 0.8) !important;
  box-shadow: 0 0 12px rgba(167, 139, 250, 0.3) !important;
}

.search-input :deep(.ant-input) {
  color: #374151;
  font-size: 14px;
}

.search-input :deep(.ant-input::placeholder) {
  color: #9ca3af;
}

.search-input :deep(.ant-input-search-button) {
  background: #a78bfa;
  border-color: #a78bfa;
  color: white;
  font-weight: 600;
  border-radius: 6px;
}

.search-input :deep(.ant-input-search-button:hover) {
  background: #c4b5fd;
  border-color: #c4b5fd;
}

.icon-hover {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
