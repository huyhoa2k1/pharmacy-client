<template>
  <a-card :bordered="false" class="information-card">
    <template #title>
      <div>
        <p class="section-eyebrow">Hồ sơ tài khoản</p>
        <h2 class="section-title">Thông tin cá nhân</h2>
      </div>
    </template>

    <div class="information-content">
      <a-avatar :size="88" class="information-avatar">
        <template #icon>
          <UserOutlined />
        </template>
      </a-avatar>

      <dl class="information-list">
        <div class="information-list__item">
          <dt>Họ và tên</dt>
          <dd>{{ user?.username || 'Chưa cập nhật' }}</dd>
        </div>
        <div class="information-list__item">
          <dt>Email</dt>
          <dd>{{ user?.email || 'Chưa cập nhật' }}</dd>
        </div>
        <div class="information-list__item">
          <dt>Điện thoại</dt>
          <dd>{{ user?.phone || 'Chưa cập nhật' }}</dd>
        </div>
      </dl>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UserOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const user = computed(() =>
  userStore.isLogin
    ? {
        username: userStore.username,
        email: userStore.email,
        phone: userStore.phone,
      }
    : null,
)
</script>

<style scoped>
.information-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-card);
  box-shadow: var(--shadow-md);
}

.section-eyebrow {
  margin: 0 0 var(--space-xs);
  color: var(--color-primary);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.section-title {
  margin: 0;
  color: var(--color-foreground);
  font-size: 1.5rem;
  line-height: 1.25;
}

.information-content {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: var(--space-xl);
  padding: var(--space-sm) 0;
}

.information-avatar {
  border: 4px solid var(--color-background);
  background: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.information-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-md);
  margin: 0;
}

.information-list__item {
  min-width: 0;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
}

.information-list dt {
  margin-bottom: var(--space-xs);
  color: var(--color-muted-foreground);
  font-size: 0.8125rem;
}

.information-list dd {
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--color-foreground);
  font-weight: 700;
}

@media (max-width: 1023px) {
  .information-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 575px) {
  .information-content {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
}
</style>
