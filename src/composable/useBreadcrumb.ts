import { ref } from 'vue'
import { CategoryService } from '@/api/services/category'

const cache = {
  category: new Map(),
}

export function useBreadcrumb() {
  const getCategoryName = async (id: number) => {
    if (cache.category.has(id)) {
      return cache.category.get(id)
    }

    // 👉 gọi API thật
    const category = await CategoryService.getCategoryById(id)
    const name = category.name

    cache.category.set(id, name)
    return name
  }

  return { getCategoryName }
}
