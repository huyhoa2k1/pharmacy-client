<template>
    <div style="display: flex; align-items: flex-start; gap: 16px; height: 100%">
        <div>
            <a-card class="abc">
                <div class="flex flex-col items-center gap-1 text-white">
                    <a-avatar :size="64">
                        <template #icon>
                            <UserOutlined />
                        </template>
                    </a-avatar>
                    <div>{{ user?.userName }}</div>
                    <div>{{ user?.phone }}</div>
                </div>
            </a-card>
            <a-menu id="dddddd" v-model:openKeys="openKeys" v-model:selectedKeys="selectedKeys"
                style="width: 256px; border-radius: 8px; margin-top: 8px;" mode="inline" :items="items"
                @click="handleClick"></a-menu>
        </div>
        <main style="flex: 1">
            <router-view></router-view>
        </main>
    </div>
</template>
<script lang="ts" setup>
import { reactive, ref, watch, VueElement, h } from 'vue';
import { UserOutlined, ShoppingOutlined } from '@ant-design/icons-vue';
import type { MenuProps, ItemType } from 'ant-design-vue';
import router from '@/router';

const selectedKeys = ref<string[]>(['1']);
const openKeys = ref<string[]>(['sub1']);

const userInfo = localStorage.getItem('pharmacy_user');
const user = userInfo ? JSON.parse(userInfo) : null;

function getItem(
    label: VueElement | string,
    key: string,
    icon?: any,
    children?: ItemType[],
    type?: 'group',
    onClick?: MenuProps['onClick']
): ItemType {
    return {
        key,
        icon,
        children,
        label,
        type,
        onClick
    } as ItemType;
}

const items: ItemType[] = reactive([
    getItem('Thông tin cá nhân', 'sub1', () => h(UserOutlined), undefined, undefined, () => router.push('/ca-nhan/thong-tin')),

    getItem('Đơn hàng của tôi', 'sub2', () => h(ShoppingOutlined), undefined, undefined, () => router.push('/ca-nhan/don-hang'))
]);

const handleClick: MenuProps['onClick'] = e => {
    console.log('click', e);
};

watch(openKeys, val => {
    console.log('openKeys', val);
});
</script>

<style scoped>
:deep(.ant-card.abc) {
    background: #a576f0;
}
</style>