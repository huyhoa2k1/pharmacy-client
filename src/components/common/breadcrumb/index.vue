<template>
    <div class="breadcrumb-container mr-auto ml-auto">
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
import { ref, watch } from 'vue'
import { useBreadcrumb } from '@/composable/useBreadcrumb'

const route = useRoute()
const { getCategoryName } = useBreadcrumb()
const breadcrumbs = ref([])

const buildBreadcrumbs = async () => {
    const isAdminRoute = route.path.startsWith('/admin/')
    const base = route.matched
        .filter(r => r.meta?.title && r.meta?.breadcrumb !== false)
        .map((r, index, arr) => {
            return {
                label: r.meta.breadcrumb || r.meta.title,
                link: index < arr.length - 1 ? r.path : null
            }
        })

    base.unshift(isAdminRoute
        ? { label: 'Hệ thống quản trị', link: null }
        : { label: 'Trang chủ', link: '/' })

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
    padding: var(--space-md) var(--space-xl);
    border: 1px solid var(--color-border);
    border-bottom: 0;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    background: var(--color-card);
}

.breadcrumb-inner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--color-muted-foreground);
    font-size: 0.95rem;
}

.breadcrumb-item+.breadcrumb-item::before {
    color: var(--color-border);
    margin-right: 0.6rem;
}

.breadcrumb-link {
    color: var(--color-primary);
    text-decoration: none;
    transition: color 0.2s ease, transform 0.2s ease;
}

.breadcrumb-link:hover {
    color: var(--color-accent);
    transform: translateX(1px);
}

.breadcrumb-current {
    color: var(--color-foreground);
    font-weight: 600;
}

@media (max-width: 640px) {
    .breadcrumb-container {
        padding: var(--space-md) var(--space-lg);
        border-radius: var(--radius-md) var(--radius-md) 0 0;
    }
}
</style>
