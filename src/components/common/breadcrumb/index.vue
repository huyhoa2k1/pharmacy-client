<template>
    <div class="breadcrumb-container w-7xl mr-auto ml-auto">
        <a-breadcrumb separator=">" class="breadcrumb-inner">
            <a-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index" class="breadcrumb-item">
                <router-link v-if="item.link" :to="item.link" class="breadcrumb-link">
                    {{ item.label }}
                </router-link>
                <span v-else class="breadcrumb-current">{{ item.label }}</span>
            </a-breadcrumb-item>
        </a-breadcrumb>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed, ref, watch } from 'vue'
import { useBreadcrumb } from '@/composable/useBreadcrumb'

const route = useRoute()
const { getCategoryName } = useBreadcrumb()
const breadcrumbs = ref([])

const buildBreadcrumbs = async () => {
    const base = route.matched
        .filter(r => r.meta?.title && r.meta?.breadcrumb !== false)
        .map((r, index, arr) => {
            return {
                label: r.meta.breadcrumb || r.meta.title,
                link: index < arr.length - 1 ? r.path : null
            }
        })

    base.unshift({
        label: 'Trang chủ',
        link: '/'
    })

    if (route.name === 'products') {
        const categoryName = await getCategoryName(Number(route.params.categoryId))
        if (base.length) {
            // replace the last breadcrumb (the products route) with the category name
            base[base.length - 1].label = categoryName
            base[base.length - 1].link = null
        } else {
            base.push({ label: categoryName, link: null })
        }
        return base
    }

    if (route.name === 'product-detail') {
        const categoryName = await getCategoryName(route.params.categoryId)

        base.splice(1, 0, {
            label: categoryName,
            link: `/${route.params.categoryId}/products`
        })
    }

    return base
}

watch(() => route.fullPath, async () => {
    breadcrumbs.value = await buildBreadcrumbs()
}, { immediate: true })

</script>

<style scoped>
.breadcrumb-container {
    margin: 0 auto;
    padding: 14px 16px;
}

.breadcrumb-inner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #4b5563;
    font-size: 0.95rem;
}

.breadcrumb-item+.breadcrumb-item::before {
    color: #9ca3af;
    margin-right: 0.6rem;
}

.breadcrumb-link {
    color: #4338ca;
    text-decoration: none;
    transition: color 0.2s ease, transform 0.2s ease;
}

.breadcrumb-link:hover {
    color: #7c3aed;
    transform: translateX(1px);
}

.breadcrumb-current {
    color: #111827;
    font-weight: 600;
}
</style>
