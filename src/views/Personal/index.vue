<template>
  <section class="personal-layout">
    <aside class="personal-sidebar">
      <a-card :bordered="false" class="profile-card">
        <div class="profile-card__content">
          <a-avatar :size="72" class="profile-card__avatar">
            <template #icon>
              <UserOutlined />
            </template>
          </a-avatar>
          <div>
            <p class="profile-card__eyebrow">Tài khoản của tôi</p>
            <h1 class="profile-card__name">{{ user?.userName || 'Khách hàng' }}</h1>
            <p class="profile-card__phone">{{ user?.phone || 'Chưa cập nhật số điện thoại' }}</p>
          </div>
        </div>
      </a-card>

      <nav class="personal-navigation" aria-label="Tài khoản cá nhân">
        <router-link
          v-for="item in navigationItems"
          :key="item.key"
          :to="item.to"
          class="personal-navigation__link"
          active-class="personal-navigation__link--active"
        >
          <component :is="item.icon" class="personal-navigation__icon" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
    </aside>

    <main class="personal-content">
      <router-view />
    </main>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ShoppingOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const user = computed(() =>
  userStore.isLogin
    ? {
        userName: userStore.username,
        phone: userStore.phone,
      }
    : null,
)

const navigationItems = [
  { key: 'information', label: 'Thông tin cá nhân', to: '/ca-nhan/thong-tin', icon: UserOutlined },
  { key: 'orders', label: 'Đơn hàng của tôi', to: '/ca-nhan/don-hang', icon: ShoppingOutlined },
]
</script>

<style scoped>
.personal-layout {
  display: grid;
  grid-template-columns: minmax(240px, 280px) minmax(0, 1fr);
  align-items: start;
  gap: var(--space-lg);
  min-height: 100%;
}

.personal-sidebar {
  position: sticky;
  top: var(--space-lg);
}

.profile-card {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-card);
  box-shadow: var(--shadow-md);
}

.profile-card__content {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--color-primary);
  color: #ffffff;
}

.profile-card__avatar {
  flex: 0 0 auto;
  border: 3px solid rgba(255, 255, 255, 0.7);
  background: var(--color-card);
  color: var(--color-primary);
}

.profile-card__eyebrow,
.profile-card__phone {
  margin: 0;
  font-size: 0.8125rem;
}

.profile-card__eyebrow {
  opacity: 0.8;
}

.profile-card__name {
  margin: var(--space-xs) 0;
  color: #ffffff;
  font-size: 1.25rem;
  line-height: 1.3;
}

.profile-card__phone {
  word-break: break-word;
  opacity: 0.9;
}

.personal-navigation {
  display: grid;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
  padding: var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card);
  box-shadow: var(--shadow-sm);
}

.personal-navigation__link {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-height: 48px;
  padding: 0 var(--space-md);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--color-foreground);
  font-weight: 600;
  text-decoration: none;
  transition:
    background-color var(--transition-base),
    border-color var(--transition-base),
    color var(--transition-base),
    box-shadow var(--transition-base);
}

.personal-navigation__link:hover {
  border-color: var(--color-border);
  background: var(--color-background);
  color: var(--color-primary);
}

.personal-navigation__link:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-ring) 35%, transparent);
  outline-offset: 2px;
}

.personal-navigation__link--active {
  border-color: var(--color-border);
  background: var(--color-background);
  color: var(--color-primary);
  box-shadow: inset 3px 0 0 var(--color-accent);
}

.personal-navigation__icon {
  font-size: 1.125rem;
}

.personal-content {
  min-width: 0;
}

@media (max-width: 767px) {
  .personal-layout {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .personal-sidebar {
    position: static;
  }

  .personal-navigation {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .personal-navigation__link {
    justify-content: center;
    padding: 0 var(--space-sm);
    font-size: 0.875rem;
  }
}
</style>
