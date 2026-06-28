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
import { UserOutlined } from '@ant-design/icons-vue';

const userInfo = localStorage.getItem('pharmacy_user');
const user = userInfo ? JSON.parse(userInfo) : null;
</script>

<style scoped></style>