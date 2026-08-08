<template>
    <a-popover trigger="click">
        <template #content>
            <div class="notification-list">
                <div class="d-flex justify-content-between pb-2" style="border-bottom: 1px solid #ccc">
                    <div class="notification-list__action" @click="markAllRead">
                        <span class="font-semibold">Đánh dấu tất cả là đã đọc</span>
                    </div>
                </div>

                <div>
                    <a-list item-layout="horizontal" :data-source="paginatedList">
                        <template #renderItem="{ item }">
                            <a-list-item>
                                <a-list-item-meta>
                                    <template #description>
                                        <span :class="item.isReaded ? '' : 'unread-notification'">{{ item.message
                                            }}</span>
                                        <div style="font-size: 12px" class="flex gap-1 items-center mt-1 text-primary">
                                            <ClockCircleOutlined />
                                            <span>{{ formatTime(item.createdAt) }}</span>
                                        </div>
                                    </template>
                                </a-list-item-meta>
                            </a-list-item>
                        </template>
                    </a-list>

                    <a-pagination class="mt-3" :current="currentPage" :page-size="pageSize" :total="listNoti.length"
                        show-size-changer @change="handlePageChange" @showSizeChange="handlePageSizeChange" />
                </div>
            </div>
        </template>

        <template #default>
            <a-badge :count="unreadCount">
                <div
                    style="padding: 8px; border-radius: 50%; background: #f0f0f0; cursor: pointer; transition: background 0.3s">
                    <BellFilled style=" font-size: 20px; color: dodgerblue" />
                </div>
            </a-badge>
        </template>
    </a-popover>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
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
        debug: () => { },
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
    width: 400px;
}

.notification-list__action:hover {
    cursor: pointer;
    color: blue;
}

.unread-notification {
    font-weight: 500;
    color: #f56a00;
}
</style>
