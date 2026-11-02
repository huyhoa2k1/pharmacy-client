# Hướng dẫn hiệu ứng hạt (tsParticles) ở trang chủ

Hiệu ứng rơi (tuyết, hoa đào, lá...) hiển thị toàn màn hình ở `HomeView`, dùng [tsParticles](https://particles.js.org/).

## Các file liên quan

| File | Vai trò |
| --- | --- |
| `src/config/particleEffects.ts` | Nơi khai báo **tất cả hiệu ứng** và hiệu ứng đang bật |
| `src/main.ts` | Đăng ký plugin `@tsparticles/vue3` + nạp bộ `@tsparticles/slim` |
| `src/views/HomeView.vue` | Hiển thị `<vue-particles>` với cấu hình lấy từ file trên |

## Đổi hiệu ứng

Mở `src/config/particleEffects.ts`, sửa dòng:

```ts
export const ACTIVE_PARTICLE_EFFECT: ParticleEffectName = 'snow'
```

Các giá trị có sẵn:

| Giá trị | Hiệu ứng |
| --- | --- |
| `'snow'` | Tuyết rơi |
| `'sakura'` | Hoa đào 🌸 (rơi chéo, xoay, lắc nhẹ) |
| `'apricotBlossom'` | Hoa mai 🌼 |
| `'autumnLeaves'` | Lá mùa thu 🍂🍁 |
| `'stars'` | Sao lấp lánh |
| `'confetti'` | Giấy confetti nhiều màu |
| `'none'` | Tắt hiệu ứng |

## Chỉnh thông số

Mỗi hiệu ứng nằm trong `particleEffects`, phần `particles`:

| Thông số | Ý nghĩa | Ví dụ |
| --- | --- | --- |
| `number.value` | Số lượng hạt (tăng = dày hơn) | `35` |
| `size.value` | Kích thước hạt; số cố định hoặc `{ min, max }` | `{ min: 10, max: 20 }` |
| `opacity.value` | Độ trong suốt 0–1 | `{ min: 0.6, max: 1 }` |
| `move.speed` | Tốc độ rơi | `{ min: 1, max: 2.5 }` |
| `move.direction` | Hướng: `bottom`, `bottomLeft`, `bottomRight`, `top`, `left`, `right`... | `'bottomRight'` |
| `wobble` | Độ lắc ngang (`distance`, `speed`) | `{ enable: true, distance: 15, speed: {...} }` |
| `rotate.animation.speed` | Tốc độ xoay | `8` |
| `color.value` | Màu (không áp dụng cho emoji) | `'#ffffff'` hoặc `['#f00', '#0f0']` |
| `shape` | Hình dạng hạt | xem bên dưới |

Z-index của lớp hạt: `fullScreen.zIndex` trong `baseOptions` (hiện `50`). Lớp này có `pointer-events: none` nên không chặn click.

## Đổi hình dạng hạt

### Emoji (đơn giản nhất)

Dùng helper `emojiShape`, truyền một hoặc nhiều emoji (chọn ngẫu nhiên):

```ts
shape: emojiShape(['🌸', '🌺'])
```

### Hình có sẵn

```ts
shape: { type: 'circle' }             // hoặc 'square', 'star', 'line', 'polygon'
shape: { type: ['square', 'circle'] } // trộn nhiều loại
```

### Ảnh riêng (ví dụ cánh hoa đào PNG)

1. Đặt ảnh vào `public/particles/petal.png`.
2. Dùng cấu hình:

```ts
shape: {
  type: 'image',
  options: {
    image: { src: '/particles/petal.png', width: 32, height: 32, replaceColor: false },
  },
}
```

Có thể truyền mảng nhiều ảnh trong `image: [ {...}, {...} ]`.

## Thêm hiệu ứng mới

1. Thêm tên vào type `ParticleEffectName`.
2. Thêm một mục mới vào `particleEffects`, ví dụ:

```ts
hearts: {
  ...baseOptions,
  particles: {
    number: { value: 25, density: { enable: true } },
    shape: emojiShape(['❤️', '💊']),
    size: { value: { min: 12, max: 20 } },
    move: { enable: true, direction: 'top', speed: { min: 1, max: 2 }, outModes: { default: 'out' } },
  },
},
```

3. Đặt `ACTIVE_PARTICLE_EFFECT = 'hearts'`.

## Dùng hiệu ứng ở trang khác

```vue
<script setup lang="ts">
import { getParticleOptions } from '@/config/particleEffects'
const particleOptions = getParticleOptions('sakura') // không truyền = dùng hiệu ứng mặc định
</script>

<template>
  <vue-particles v-if="particleOptions" id="myParticles" :options="particleOptions" />
</template>
```

Mỗi trang cần `id` riêng cho `<vue-particles>`.

## Lưu ý

- Bộ `slim` đã bao gồm shape `circle`, `square`, `star`, `line`, `polygon`, `emoji`, `image`. Hiệu ứng nâng cao khác (pháo hoa, phát xạ...) cần cài thêm gói `@tsparticles/*` tương ứng và nạp trong `main.ts`.
- Số hạt lớn (> 150) có thể làm giật máy yếu; nên giữ ở mức vừa phải.
- Tài liệu đầy đủ các option: https://particles.js.org/docs/
