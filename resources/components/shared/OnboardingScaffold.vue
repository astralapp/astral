<script setup lang="ts">
import AuthStarfield from '@/components/auth/AuthStarfield.vue'
import LogoSvg from '@/img/logo.svg?component'
</script>

<template>
  <div class="relative grid min-h-dvh w-full place-items-center overflow-hidden bg-gray-950 px-6 py-12">
    <!-- Cosmic field: a faint aurora glow and a starfield. Decorative; static under reduced motion. -->
    <div
      class="aurora pointer-events-none absolute inset-0"
      aria-hidden="true"
    ></div>

    <AuthStarfield class="absolute inset-0" />

    <div class="onboarding-content relative z-10 flex w-full max-w-md flex-col items-center text-center">
      <LogoSvg
        role="img"
        aria-label="Astral"
        class="h-8 w-auto fill-current text-white"
      />

      <slot />
    </div>
  </div>
</template>

<style scoped>
/* A faint green aurora behind the wordmark, plus a low horizon glow. Matches the auth page. */
.aurora {
  background: radial-gradient(55% 45% at 50% 34%, rgba(16, 185, 129, 0.16), transparent 70%),
    radial-gradient(45% 32% at 50% 102%, rgba(5, 150, 105, 0.1), transparent 70%);
}

@media (prefers-reduced-motion: no-preference) {
  .aurora {
    animation: aurora-breathe 12s ease-in-out infinite alternate;
  }
}

@keyframes aurora-breathe {
  from {
    opacity: 0.75;
  }

  to {
    opacity: 1;
  }
}

/* One restrained entrance for the page. */
.onboarding-content {
  animation: onboarding-rise 500ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes onboarding-rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .onboarding-content {
    animation: none;
  }
}
</style>
