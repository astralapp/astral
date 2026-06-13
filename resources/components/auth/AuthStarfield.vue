<script lang="ts" setup>
import { useEventListener, useMediaQuery, useRafFn, useResizeObserver } from '@vueuse/core'
import { nextTick, onMounted, ref, watch } from 'vue'

type Star = {
  layer: number
  x: number
  y: number
  radius: number
  alpha: number
  twinklePhase: number
  twinkleSpeed: number
  rgb: string
}

type Meteor = {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  lifespan: number
}

const WHITE_RGB = '255, 255, 255'
const GREEN_RGB = '110, 231, 183'
const GREEN_STAR_RATIO = 0.12

// Far stars are small, dim, and slow; near stars are brighter, drift faster, and parallax harder.
const LAYERS = [
  { share: 0.5, drift: 2, parallax: 3, radius: [0.4, 0.8], alpha: [0.2, 0.45] },
  { share: 0.3, drift: 4, parallax: 6, radius: [0.6, 1.1], alpha: [0.3, 0.65] },
  { share: 0.2, drift: 7, parallax: 10, radius: [0.9, 1.6], alpha: [0.5, 0.9] },
] as const

const VIEWPORT_AREA_PER_STAR = 9000
const METEOR_DELAY_RANGE = [7, 16] as const
const METEOR_TAIL_SECONDS = 0.12

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const container = ref<HTMLDivElement>()
const canvas = ref<HTMLCanvasElement>()
const running = ref(false)

let ctx: CanvasRenderingContext2D | null = null
let width = 0
let height = 0
let elapsed = 0
let stars: Star[] = []
let meteor: Meteor | null = null
let nextMeteorIn = randomBetween(...METEOR_DELAY_RANGE)

const pointerTarget = { x: 0, y: 0 }
const pointerEased = { x: 0, y: 0 }

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function createStar(layerIndex: number): Star {
  const layer = LAYERS[layerIndex] ?? LAYERS[0]

  return {
    layer: layerIndex,
    x: Math.random() * width,
    y: Math.random() * height,
    radius: randomBetween(...layer.radius),
    alpha: randomBetween(...layer.alpha),
    twinklePhase: Math.random() * Math.PI * 2,
    twinkleSpeed: randomBetween(0.4, 1.4),
    rgb: Math.random() < GREEN_STAR_RATIO ? GREEN_RGB : WHITE_RGB,
  }
}

function syncStarCounts() {
  LAYERS.forEach((layer, layerIndex) => {
    const target = Math.round(((width * height) / VIEWPORT_AREA_PER_STAR) * layer.share)
    const current = stars.filter(star => star.layer === layerIndex).length

    if (current < target) {
      stars.push(...Array.from({ length: target - current }, () => createStar(layerIndex)))
    } else if (current > target) {
      let excess = current - target
      stars = stars.filter(star => star.layer !== layerIndex || --excess < 0)
    }
  })
}

function resizeCanvas() {
  if (!canvas.value || !container.value) return

  const rect = container.value.getBoundingClientRect()
  // Cap DPR so 4k/retina displays don't quadruple the paint area for a decorative layer.
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const previousWidth = width
  const previousHeight = height

  width = rect.width
  height = rect.height
  canvas.value.width = Math.round(width * dpr)
  canvas.value.height = Math.round(height * dpr)
  ctx = canvas.value.getContext('2d')
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)

  // Scale existing stars into the new bounds so resizing never re-randomizes the sky.
  if (previousWidth > 0 && previousHeight > 0) {
    for (const star of stars) {
      star.x *= width / previousWidth
      star.y *= height / previousHeight
    }
  }

  syncStarCounts()
}

function drawStars(dt: number) {
  if (!ctx) return

  for (const star of stars) {
    const layer = LAYERS[star.layer]
    if (!layer) continue

    star.y -= layer.drift * dt

    if (star.y < -2) {
      star.y = height + 2
      star.x = Math.random() * width
    }

    const twinkle = 0.72 + 0.28 * Math.sin(star.twinklePhase + elapsed * star.twinkleSpeed)
    const alpha = star.alpha * twinkle
    const x = star.x + pointerEased.x * layer.parallax
    const y = star.y + pointerEased.y * layer.parallax

    ctx.beginPath()
    ctx.arc(x, y, star.radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${star.rgb}, ${alpha})`
    ctx.fill()

    if (star.layer === LAYERS.length - 1) {
      ctx.beginPath()
      ctx.arc(x, y, star.radius * 2.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${star.rgb}, ${alpha * 0.12})`
      ctx.fill()
    }
  }
}

function spawnMeteor() {
  const direction = Math.random() < 0.5 ? 1 : -1
  const speed = randomBetween(420, 640)
  const angle = randomBetween(0.25, 0.45)

  meteor = {
    x: randomBetween(width * 0.15, width * 0.85),
    y: randomBetween(height * 0.05, height * 0.35),
    vx: Math.cos(angle) * speed * direction,
    vy: Math.sin(angle) * speed,
    age: 0,
    lifespan: randomBetween(0.6, 1),
  }
}

function drawMeteor(dt: number) {
  if (!ctx) return

  if (!meteor) {
    nextMeteorIn -= dt
    if (nextMeteorIn <= 0) spawnMeteor()
    return
  }

  meteor.age += dt

  if (meteor.age >= meteor.lifespan) {
    meteor = null
    nextMeteorIn = randomBetween(...METEOR_DELAY_RANGE)
    return
  }

  meteor.x += meteor.vx * dt
  meteor.y += meteor.vy * dt

  const progress = meteor.age / meteor.lifespan
  const fade = Math.min(progress / 0.2, (1 - progress) / 0.4, 1)
  const tailX = meteor.x - meteor.vx * METEOR_TAIL_SECONDS
  const tailY = meteor.y - meteor.vy * METEOR_TAIL_SECONDS
  const tail = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY)
  tail.addColorStop(0, `rgba(${WHITE_RGB}, ${0.75 * fade})`)
  tail.addColorStop(1, `rgba(${WHITE_RGB}, 0)`)

  ctx.beginPath()
  ctx.moveTo(meteor.x, meteor.y)
  ctx.lineTo(tailX, tailY)
  ctx.strokeStyle = tail
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.stroke()
}

function drawFrame(deltaMs: number) {
  if (!ctx) return

  // Clamp the delta so returning from a hidden tab doesn't teleport stars and meteors.
  const dt = Math.min(deltaMs, 100) / 1000
  elapsed += dt

  const smoothing = 1 - Math.exp(-dt * 4)
  pointerEased.x += (pointerTarget.x - pointerEased.x) * smoothing
  pointerEased.y += (pointerTarget.y - pointerEased.y) * smoothing

  ctx.clearRect(0, 0, width, height)
  drawStars(dt)
  drawMeteor(dt)
}

const { pause, resume } = useRafFn(({ delta }) => drawFrame(delta), { immediate: false })

function start() {
  resizeCanvas()
  resume()
  running.value = true
}

function stop() {
  pause()
  running.value = false
}

onMounted(() => {
  if (!prefersReducedMotion.value) {
    start()
  }
})

watch(prefersReducedMotion, async reduced => {
  if (reduced) {
    stop()
    return
  }

  await nextTick()
  start()
})

useResizeObserver(container, () => {
  if (!prefersReducedMotion.value) {
    resizeCanvas()
  }
})

useEventListener(window, 'pointermove', event => {
  if (event.pointerType !== 'mouse') return

  pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1
  pointerTarget.y = (event.clientY / window.innerHeight) * 2 - 1
})
</script>

<template>
  <div
    ref="container"
    class="pointer-events-none"
    aria-hidden="true"
  >
    <canvas
      v-if="!prefersReducedMotion"
      ref="canvas"
      class="block h-full w-full transition-opacity duration-700"
      :class="running ? 'opacity-100' : 'opacity-0'"
    ></canvas>

    <div
      v-else
      class="static-starfield h-full w-full"
    ></div>
  </div>
</template>

<style scoped>
/* Reduced-motion fallback: a sparse, hand-placed static starfield. */
.static-starfield {
  background-repeat: no-repeat;
  background-image: radial-gradient(1.5px 1.5px at 12% 18%, rgba(255, 255, 255, 0.7), transparent 60%),
    radial-gradient(1px 1px at 27% 42%, rgba(255, 255, 255, 0.45), transparent 60%),
    radial-gradient(1px 1px at 41% 12%, rgba(255, 255, 255, 0.5), transparent 60%),
    radial-gradient(2px 2px at 55% 28%, rgba(255, 255, 255, 0.6), transparent 60%),
    radial-gradient(1px 1px at 68% 9%, rgba(255, 255, 255, 0.4), transparent 60%),
    radial-gradient(1.5px 1.5px at 80% 22%, rgba(255, 255, 255, 0.55), transparent 60%),
    radial-gradient(1px 1px at 90% 38%, rgba(255, 255, 255, 0.4), transparent 60%),
    radial-gradient(1px 1px at 8% 62%, rgba(255, 255, 255, 0.35), transparent 60%),
    radial-gradient(1.5px 1.5px at 33% 72%, rgba(255, 255, 255, 0.4), transparent 60%),
    radial-gradient(1px 1px at 60% 80%, rgba(255, 255, 255, 0.3), transparent 60%),
    radial-gradient(1px 1px at 73% 66%, rgba(255, 255, 255, 0.35), transparent 60%),
    radial-gradient(2px 2px at 88% 78%, rgba(255, 255, 255, 0.4), transparent 60%),
    radial-gradient(1px 1px at 18% 88%, rgba(255, 255, 255, 0.3), transparent 60%),
    radial-gradient(1px 1px at 48% 54%, rgba(255, 255, 255, 0.28), transparent 60%),
    radial-gradient(1.5px 1.5px at 95% 55%, rgba(255, 255, 255, 0.4), transparent 60%),
    radial-gradient(1px 1px at 5% 35%, rgba(255, 255, 255, 0.4), transparent 60%);
}
</style>
