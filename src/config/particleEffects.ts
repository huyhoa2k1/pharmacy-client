import type { ISourceOptions } from '@tsparticles/engine'

export type ParticleEffectName =
  | 'snow'
  | 'sakura'
  | 'apricotBlossom'
  | 'autumnLeaves'
  | 'stars'
  | 'confetti'
  | 'none'

// Đổi giá trị này để đổi hiệu ứng trên trang chủ. Xem hướng dẫn: src/docs/particles.md
export const ACTIVE_PARTICLE_EFFECT: ParticleEffectName = 'autumnLeaves'

const baseOptions: ISourceOptions = {
  fullScreen: { enable: true, zIndex: 50 },
  fpsLimit: 60,
  detectRetina: true,
  interactivity: { events: { resize: { enable: true } } },
}

const emojiShape = (emojis: string[]) => ({
  type: 'emoji',
  options: { emoji: { value: emojis } },
})

export const particleEffects: Record<Exclude<ParticleEffectName, 'none'>, ISourceOptions> = {
  snow: {
    ...baseOptions,
    particles: {
      number: { value: 80, density: { enable: true } },
      color: { value: '#ffffff' },
      shape: { type: 'circle' },
      opacity: { value: { min: 0.4, max: 0.9 } },
      size: { value: { min: 2, max: 6 } },
      move: {
        enable: true,
        direction: 'bottom',
        speed: { min: 1, max: 3 },
        straight: false,
        outModes: { default: 'out' },
      },
      wobble: { enable: true, distance: 10, speed: { min: -2, max: 2 } },
    },
  },

  // Hoa đào: cánh hoa hồng rơi chậm, xoay nhẹ
  sakura: {
    ...baseOptions,
    particles: {
      number: { value: 35, density: { enable: true } },
      shape: emojiShape(['🌸']),
      opacity: { value: { min: 0.6, max: 1 } },
      size: { value: { min: 10, max: 20 } },
      rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 8 } },
      move: {
        enable: true,
        direction: 'bottomRight',
        speed: { min: 1, max: 2.5 },
        outModes: { default: 'out' },
      },
      wobble: { enable: true, distance: 15, speed: { min: -3, max: 3 } },
    },
  },

  // Hoa mai (Tết miền Nam)
  apricotBlossom: {
    ...baseOptions,
    particles: {
      number: { value: 30, density: { enable: true } },
      shape: emojiShape(['🌼', '🏵️']),
      opacity: { value: { min: 0.6, max: 1 } },
      size: { value: { min: 10, max: 20 } },
      rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 6 } },
      move: {
        enable: true,
        direction: 'bottom',
        speed: { min: 1, max: 2.5 },
        outModes: { default: 'out' },
      },
      wobble: { enable: true, distance: 12, speed: { min: -2, max: 2 } },
    },
  },

  autumnLeaves: {
    ...baseOptions,
    particles: {
      number: { value: 25, density: { enable: true } },
      shape: emojiShape(['🍂', '🍁']),
      opacity: { value: { min: 0.7, max: 1 } },
      size: { value: { min: 12, max: 22 } },
      rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 10 } },
      move: {
        enable: true,
        direction: 'bottomLeft',
        speed: { min: 1.5, max: 3 },
        outModes: { default: 'out' },
      },
      wobble: { enable: true, distance: 20, speed: { min: -3, max: 3 } },
    },
  },

  stars: {
    ...baseOptions,
    particles: {
      number: { value: 60, density: { enable: true } },
      color: { value: ['#ffd700', '#fff4a3', '#ffffff'] },
      shape: { type: 'star' },
      opacity: {
        value: { min: 0.3, max: 1 },
        animation: { enable: true, speed: 1, sync: false },
      },
      size: { value: { min: 3, max: 8 } },
      move: {
        enable: true,
        direction: 'bottom',
        speed: { min: 0.5, max: 1.5 },
        outModes: { default: 'out' },
      },
    },
  },

  confetti: {
    ...baseOptions,
    particles: {
      number: { value: 60, density: { enable: true } },
      color: { value: ['#ff4d6d', '#ffd166', '#06d6a0', '#118ab2', '#9b5de5'] },
      shape: { type: ['square', 'circle'] },
      opacity: { value: 0.9 },
      size: { value: { min: 4, max: 8 } },
      rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 15 } },
      move: {
        enable: true,
        direction: 'bottom',
        speed: { min: 2, max: 5 },
        outModes: { default: 'out' },
      },
    },
  },
}

export const getParticleOptions = (
  name: ParticleEffectName = ACTIVE_PARTICLE_EFFECT,
): ISourceOptions | null => (name === 'none' ? null : particleEffects[name])
