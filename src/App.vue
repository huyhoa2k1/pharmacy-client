<script setup lang="ts">
import { useRoute } from 'vue-router'
import { pharmacyTheme } from '@/config/designSystem'

const route = useRoute()
</script>

<template>
  <a-config-provider :theme="pharmacyTheme">
    <component :is="route.meta?.layout">
      <slot></slot>
    </component>
  </a-config-provider>
</template>