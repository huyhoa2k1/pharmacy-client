<template>
    <span class="admin-status-badge" :class="`admin-status-badge--${tone}`">
        <span class="admin-status-badge__dot" aria-hidden="true" />
        {{ label }}
    </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
    label: string
    tone?: 'success' | 'info' | 'warning' | 'danger' | 'neutral'
}>(), {
    tone: 'neutral',
})
</script>

<style scoped>
.admin-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 28px;
    padding: 4px 9px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
}

.admin-status-badge__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
}

.admin-status-badge--success { background: #dcfce7; color: #166534; }
.admin-status-badge--info { background: #cffafe; color: #155e75; }
.admin-status-badge--warning { background: #fef3c7; color: #92400e; }
.admin-status-badge--danger { background: #fee2e2; color: #991b1b; }
.admin-status-badge--neutral { background: var(--color-muted); color: var(--color-muted-foreground); }
</style>
