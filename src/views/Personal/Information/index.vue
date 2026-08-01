<template>
    <a-card title="Thông tin cá nhân">
        <div class="flex flex-col items-center gap-4">
            <a-avatar :size="64">
                <template #icon>
                    <UserOutlined />
                </template>
            </a-avatar>
            <div>
                <div>
                    <strong>Họ và tên:</strong> {{ user?.username }}
                </div>
                <div>
                    <strong>Email:</strong> {{ user?.email }}
                </div>
                <div>
                    <strong>Điện thoại:</strong> {{ user?.phone }}
                </div>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { UserOutlined } from '@ant-design/icons-vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const user = computed(() =>
    userStore.isLogin
        ? {
            username: userStore.username,
            email: userStore.email,
            phone: userStore.phone,
        }
        : null,
);
</script>

<style scoped></style>