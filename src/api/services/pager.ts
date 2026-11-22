import type { IPageResponse } from '../models/product'
import type { IPagerRequest } from '../models/pager'

const MAX_PAGE_SIZE = 100

/** Collects every page of a paged query (server caps page size at 100). */
export const fetchAllPages = async <T, R extends { pager?: IPagerRequest }>(
  query: (request: R) => Promise<IPageResponse<T>>,
  request: R,
): Promise<T[]> => {
  const items: T[] = []
  let pageNo = 0
  let totalPages = 1
  while (pageNo < totalPages) {
    const page = await query({
      ...request,
      pager: { ...request.pager, pageNo, pageSize: MAX_PAGE_SIZE },
    })
    items.push(...page.content)
    totalPages = page.totalPages
    pageNo++
  }
  return items
}
