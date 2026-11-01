<template>
    <div ref="mapEl" class="map-picker" :style="{ height }" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { IMapPoint as MapPoint, IMapStoreMarker as MapStoreMarker } from '@/api/models/store';

const props = withDefaults(defineProps<{
    modelValue?: MapPoint | null;
    storeMarkers?: MapStoreMarker[];
    readonly?: boolean;
    height?: string;
}>(), {
    modelValue: null,
    storeMarkers: () => [],
    readonly: false,
    height: '320px',
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: MapPoint): void;
    (e: 'select-store', id: number | string): void;
}>();

// Vite không resolve được đường dẫn icon mặc định của Leaflet nên khai báo lại
// Phải xoá _getIconUrl, nếu không Leaflet nối thêm imagePath tự dò vào URL và làm hỏng ảnh
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const VIETNAM_CENTER: L.LatLngTuple = [16.0, 106.0];
const mapEl = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;
let pin: L.Marker | null = null;
let storeLayer: L.LayerGroup | null = null;

const storeIcon = L.divIcon({
    className: 'store-pin',
    html: '<span></span>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
});

const setPin = (point: MapPoint | null, pan: boolean) => {
    if (!map) return;
    if (!point) {
        pin?.remove();
        pin = null;
        return;
    }
    const latLng = L.latLng(point.lat, point.lng);
    if (!pin) {
        pin = L.marker(latLng, { draggable: !props.readonly }).addTo(map);
        pin.on('dragend', () => {
            const pos = pin!.getLatLng();
            emit('update:modelValue', { lat: pos.lat, lng: pos.lng });
        });
    } else if (!pin.getLatLng().equals(latLng)) {
        pin.setLatLng(latLng);
    }
    if (pan) {
        map.setView(latLng, Math.max(map.getZoom(), 15));
    }
};

const renderStores = () => {
    if (!map || !storeLayer) return;
    storeLayer.clearLayers();
    props.storeMarkers.forEach((s) => {
        L.marker([s.lat, s.lng], { icon: storeIcon, title: s.label })
            .bindTooltip(s.label)
            .on('click', () => emit('select-store', s.id))
            .addTo(storeLayer!);
    });
};

const fitAll = () => {
    if (!map) return;
    const points: L.LatLngTuple[] = props.storeMarkers.map((s) => [s.lat, s.lng]);
    if (props.modelValue) points.push([props.modelValue.lat, props.modelValue.lng]);
    if (points.length === 0) return;
    if (points.length === 1) {
        map.setView(points[0], 15);
    } else {
        map.fitBounds(L.latLngBounds(points), { padding: [32, 32], maxZoom: 15 });
    }
};

onMounted(() => {
    if (!mapEl.value) return;
    map = L.map(mapEl.value).setView(VIETNAM_CENTER, 5);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    storeLayer = L.layerGroup().addTo(map);

    if (!props.readonly) {
        map.on('click', (e: L.LeafletMouseEvent) => {
            emit('update:modelValue', { lat: e.latlng.lat, lng: e.latlng.lng });
        });
    }

    renderStores();
    setPin(props.modelValue, false);
    fitAll();
});

watch(() => props.modelValue, (value) => setPin(value, true));
watch(() => props.storeMarkers, () => {
    renderStores();
    fitAll();
}, { deep: true });

onBeforeUnmount(() => {
    map?.remove();
    map = null;
});
</script>

<style scoped>
.map-picker {
    width: 100%;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    overflow: hidden;
    z-index: 0;
}

:global(.store-pin span) {
    display: block;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--color-primary);
    border: 3px solid #fff;
    box-shadow: 0 1px 4px rgb(0 0 0 / 40%);
}
</style>
