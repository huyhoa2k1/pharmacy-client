<template>
    <div class="order-card">
        <div class="order-header">
            <div class="left">
                <strong>Đơn hàng {{ order.date }}</strong>
                <span class="dot-sep">•</span>
                <span class="delivery">{{ order.delivery }}</span>
                <span class="dot-sep">•</span>
                <span class="number">#{{ order.number }}</span>
            </div>
            <div class="status"><span class="status-dot" :class="order.status"></span> {{ order.statusText }}</div>
        </div>

        <div class="order-body">
            <div class="product" v-for="(it, i) in order.items" :key="i">
                <div class="info">
                    <div class="title">{{ it.title }}</div>
                    <div class="meta">{{ formatCurrency(it.price) }} <span class="qty">x{{ it.qty }}</span></div>
                </div>
                <div class="item-price">{{ formatCurrency(it.price * it.qty) }}</div>
            </div>
        </div>

        <div class="order-footer">
            <a class="detail">Xem chi tiết</a>
            <div class="right">
                <div class="total">Thành tiền: <strong>{{ formatCurrency(order.total) }}</strong></div>
                <a-button type="primary" size="small">Mua lại</a-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

const props = defineProps<{ order: any }>();

const order = props.order || {
    date: '',
    delivery: '',
    number: '',
    status: 'delivered',
    statusText: '',
    items: [],
    total: 0,
};

const formatCurrency = (value: number) => {
    if (typeof value !== 'number') return '';
    return new Intl.NumberFormat('vi-VN').format(value) + '₫';
};
</script>

<style scoped>
.order-card {
    background: #fff;
    border: 1px solid #e6eaf0;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 12px;
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px
}

.order-header .left {
    color: #333
}

.dot-sep {
    margin: 0 8px;
    color: #999
}

.status {
    color: #228B22;
    font-weight: 600
}

.status-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: middle
}

.status-dot.delivered {
    background: #28a745
}

.status-dot.pending {
    background: #ffc107
}

.order-body {
    border-top: 1px solid #f0f2f5;
    padding-top: 12px;
}

.product {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px dashed #f2f4f7
}

.product:last-child {
    border-bottom: none
}

.thumb {
    width: 56px;
    height: 56px;
    object-fit: cover;
    border-radius: 6px;
    background: #fafafa
}

.info {
    flex: 1
}

.title {
    font-size: 14px;
    color: #222;
    margin-bottom: 6px
}

.meta {
    color: #777;
    font-size: 13px
}

.qty {
    margin-left: 8px;
    color: #333
}

.item-price {
    min-width: 80px;
    text-align: right;
    font-weight: 600
}

.order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px
}

.detail {
    color: #1677ff;
    cursor: pointer
}

.total {
    margin-right: 12px
}

.right {
    display: flex;
    align-items: center;
    gap: 12px
}
</style>
