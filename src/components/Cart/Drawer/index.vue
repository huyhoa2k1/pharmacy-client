<template>
    <a-drawer :open="open" class="custom-class" root-class-name="root-class-name" :root-style="{ color: 'blue' }"
        style="color: red" :title="t('cartDrawer.title')" placement="right" @close="close">
        <div class="flex flex-col gap-4">
            <div class="flex justify-between items-center">
                <span class="font-semibold">{{ t('cartDrawer.label') }}</span>
            </div>
            <div class="flex flex-col gap-2">
                <input type="text" :placeholder="t('cartDrawer.placeholder')" class="p-2 border rounded" />
                <a-button type="primary">{{ t('cartDrawer.apply') }}</a-button>
            </div>
        </div>
    </a-drawer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
    open: boolean;
}>();

const emit = defineEmits(['update:open']);

function close() {
    emit('update:open', false)
}
</script>

<style scoped></style>