<template>
  <a-popover trigger="click" placement="bottomRight">
    <template #content>
      <div class="notification-list">
        <div class="notification-list__header">
          <div>
            <h2>Thông báo</h2>
            <p>{{ unreadCount ? `${unreadCount} chưa đọc` : 'Bạn đã đọc tất cả thông báo' }}</p>
          </div>
          <a-button v-if="unreadCount" type="link" size="small" @click="markAllRead">
            Đánh dấu đã đọc
          </a-button>
        </div>
        <a-empty
          v-if="!listNoti.length"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="Chưa có thông báo"
          class="notification-list__empty"
        />
        <template v-else>
          <a-list
            item-layout="horizontal"
            :data-source="paginatedList"
            class="notification-list__items"
          >
            <template #renderItem="{ item }">
              <a-list-item :class="{ 'notification-list__item--unread': !item.isReaded }">
                <a-list-item-meta>
                  <template #description>
                    <span class="notification-list__message">{{ item.message }}</span>
                    <div class="notification-list__time">
                      <ClockCircleOutlined />
                      <span>{{ formatTime(item.createdAt) }}</span>
                    </div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
          <a-pagination
            v-if="listNoti.length > pageSize"
            class="notification-list__pagination"
            :current="currentPage"
            :page-size="pageSize"
            :total="listNoti.length"
            size="small"
            show-size-changer
            @change="handlePageChange"
            @show-size-change="handlePageSizeChange"
          />
        </template>
      </div>
    </template>

    <template #default>
      <a-badge :count="unreadCount" :overflow-count="99">
        <a-button type="text" class="notification-trigger" aria-label="Mở thông báo">
          <template #icon><BellFilled /></template>
        </a-button>
      </a-badge>
    </template>
  </a-popover>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Empty } from 'ant-design-vue'
import SockJS from 'sockjs-client/dist/sockjs'
import { Client } from '@stomp/stompjs'
import { BellFilled, ClockCircleOutlined } from '@ant-design/icons-vue'
import { NotificationService } from '@/api/services/notification'
import { SOCKET_URL } from '@/helpers/https'

const listNoti = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(5)
let client: Client | null = null

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return listNoti.value.slice(start, end)
})

const unreadCount = computed(() => listNoti.value.filter((n) => !n.isReaded).length)

const fetchNotifications = async () => {
  try {
    const res = await NotificationService.getAllNotifications()
    listNoti.value = res.reverse() // newest first
  } catch (err) {
    console.error('Failed to fetch notifications', err)
  }
}

const connect = () => {
  client = new Client({
    webSocketFactory: () => new SockJS(SOCKET_URL),
    debug: () => {},
    onConnect: () => {
      client?.subscribe('/topic/notifications', (msg) => {
        try {
          const body = JSON.parse(msg.body)
          listNoti.value.unshift(body)
        } catch (e) {
          console.error('Invalid notification payload', e)
        }
      })
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame)
    },
  })
  client.activate()
}

const markAllRead = async () => {
  try {
    const res = await NotificationService.markNotificationAsRead()
    listNoti.value = res.reverse()
  } catch (err) {
    console.error('Failed to mark all read', err)
    // fallback: mark locally
    listNoti.value = listNoti.value.map((n) => ({ ...n, isReaded: true }))
  }
}

const handlePageChange = (page: any) => {
  currentPage.value = page
}
const handlePageSizeChange = (_current: any, size: any) => {
  pageSize.value = size
  currentPage.value = 1
}

const formatTime = (t: string) => {
  try {
    return new Date(t).toLocaleString()
  } catch {
    return t
  }
}

onMounted(() => {
  fetchNotifications()
  connect()
})

onBeforeUnmount(() => {
  if (client) client.deactivate()
})
</script>

<style scoped>
.notification-list {
  width: min(400px, calc(100vw - 32px));
}

.notification-list__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.notification-list__header h2,
.notification-list__header p {
  margin: 0;
}

.notification-list__header h2 {
  color: var(--color-foreground);
  font-family: Figtree, Arial, sans-serif;
  font-size: 1rem;
  font-weight: 700;
}

.notification-list__header p {
  margin-top: 2px;
  color: var(--color-muted-foreground);
  font-size: 0.75rem;
}

.notification-list__empty {
  padding: var(--space-lg) 0 var(--space-sm);
}

.notification-list__items {
  max-height: min(50vh, 360px);
  overflow-y: auto;
}

.notification-list__items :deep(.ant-list-item) {
  padding: var(--space-md) var(--space-sm);
  border-bottom-color: color-mix(in srgb, var(--color-border) 55%, transparent);
}

.notification-list__item--unread {
  position: relative;
  background: color-mix(in srgb, var(--color-primary) 7%, var(--color-card));
}

.notification-list__item--unread::before {
  position: absolute;
  top: 18px;
  left: 0;
  width: 3px;
  height: 20px;
  border-radius: 0 4px 4px 0;
  background: var(--color-primary);
  content: '';
}

.notification-list__message {
  display: block;
  color: var(--color-foreground);
  line-height: 1.45;
}

.notification-list__item--unread .notification-list__message {
  font-weight: 700;
}

.notification-list__time {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: var(--space-xs);
  color: var(--color-muted-foreground);
  font-size: 0.75rem;
}

.notification-list__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-md);
}

.notification-trigger {
  display: inline-grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 50%;
  background: var(--color-muted);
  color: var(--color-primary);
  font-size: 1.125rem;
}

.notification-trigger:hover {
  border-color: var(--color-border);
  background: color-mix(in srgb, var(--color-primary) 12%, var(--color-card));
  color: var(--color-primary) !important;
}
</style>
