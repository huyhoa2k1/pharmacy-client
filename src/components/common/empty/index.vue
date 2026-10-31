<template>
    <a-empty>
        <template #description>
            <p class="text-gray-500 dark:text-gray-400 text-lg font-medium">Bạn chưa có đơn hàng nào.</p>
            <p>Cùng khám phá hàng ngàn sản phẩm tại Nhà thuốc nhé!</p>
            <a-button :size="'large'" type="primary" class="mt-4" @click="$router.push('/')">
                Khám phá ngay
            </a-button>
        </template>
    </a-empty>
</template>