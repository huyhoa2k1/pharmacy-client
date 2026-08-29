<template>
    <div class="navbar-container">
        <nav class="px-2 py-0 w-full">
            <div class="max-w-6xl mx-auto flex items-center justify-between h-14">
                <ul class="flex space-x-8 h-full">
                    <li v-for="category in props.categories" :key="category.id" class="flex items-center group">
                        <router-link :to="`/${category.id}/products`" class="nav-link" :class="{
                            'nav-link-active': isActive(`/${category.id}/products`)
                        }">
                            {{ category.name }}
                        </router-link>
                    </li>
                </ul>
            </div>
        </nav>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { IGetCategoryResponse } from '@/api/models/category'

const route = useRoute()

const props = defineProps<{
    categories?: Array<IGetCategoryResponse>
}>()

const isActive = (path: string): boolean => {
    return route.path === path
}
</script>

<style scoped>
.navbar-container {
    width: 100%;
    background: linear-gradient(to right, #f8f9fa 0%, #f3f4f6 100%);
    border-bottom: 1px solid #e5e7eb;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.nav-link {
    color: #374151;
    font-weight: 600;
    transition: all 0.2s ease;
    padding: 1rem 0.5rem;
    border-bottom: 3px solid transparent;
    display: block;
    position: relative;
    background-color: transparent;
    border-radius: 4px;
}

.nav-link:hover {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
    background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.nav-link-active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
    background-color: color-mix(in srgb, var(--color-primary) 15%, transparent);
}

@media (max-width: 768px) {
    .navbar-container nav {
        overflow-x: auto;
    }

    .navbar-container ul {
        gap: 1rem;
        /* space-x-4 = gap: 1rem */
    }
}
</style>
